"""OpenStreetMap pela API do Overpass: as consultas, a leitura das respostas e as regras do que conta como ciclovia.

Porte de packages/db/src/cycling/osm.ts e packages/db/src/places/osm.ts. Nada aqui grava no banco.
"""

import json
import math
import re
import time
import urllib.parse
import urllib.request
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Callable

# ---------------------------------------------------------------------------
# Consultas
# ---------------------------------------------------------------------------

# Limites declarados em cada consulta. O Overpass só aceita uma consulta que precise de no máximo metade do que o
# servidor tem livre; declarar o que ela realmente precisa (e não o padrão de 180 s / 512 MiB) ajuda a entrar quando o
# servidor está cheio. Medido: as relações do PDC levam ~40 s, o resto é mais rápido.
RELATIONS_TIMEOUT_S = 90
IDS_TIMEOUT_S = 60
TILE_TIMEOUT_S = 120
MAX_SIZE = 134_217_728  # 128 MiB

# Retângulo da RMR (sul, oeste, norte, leste). O que cai fora dos 14 municípios sai quando a cidade é atribuída.
Bbox = tuple[float, float, float, float]
RMR_BBOX: Bbox = (-8.55, -35.25, -7.65, -34.8)
SIDES = ("cycleway", "cycleway:left", "cycleway:right", "cycleway:both")
INFRA_VALUES = ("track", "lane", "opposite_lane", "shared_lane", "share_busway")


def _num(n: float) -> str:
    """Um número como o JavaScript o escreve (-35 e não -35.0): as consultas ficam iguais às do script antigo."""
    return str(int(n)) if float(n).is_integer() else repr(float(n))


def _bbox(bbox: Bbox) -> str:
    return ",".join(_num(n) for n in bbox)


def infrastructure_query(bbox: Bbox = RMR_BBOX) -> str:
    """Toda via com infraestrutura cicloviária dentro de um retângulo, do PDC ou não.

    Uma etiqueta exata por linha, nunca regex: valor exato usa o índice do Overpass, regex olha cada via do retângulo.
    """
    statements = [
        '  way["highway"="cycleway"];',
        *(f'  way["{side}"="{value}"];' for side in SIDES for value in INFRA_VALUES),
        *(f'  way["highway"="{hw}"]["bicycle"="{bicycle}"];' for hw in ("footway", "pedestrian") for bicycle in ("yes", "designated")),
    ]
    body = "\n".join(statements)
    return f"[out:json][timeout:{TILE_TIMEOUT_S}][maxsize:{MAX_SIZE}][bbox:{_bbox(bbox)}];\n(\n{body}\n);\nout tags geom;"


def _round(n: float) -> float:
    # Math.round do JavaScript (meio para cima), não o arredondamento bancário do Python.
    return math.floor(n * 1e5 + 0.5) / 1e5


def infrastructure_tiles(rows: int = 3, columns: int = 2, bbox: Bbox = RMR_BBOX) -> list[Bbox]:
    """O retângulo da RMR cortado em grade: cada resposta do Overpass fica pequena e uma falha repete só um pedaço.
    Uma via na divisa aparece nos dois pedaços; merge_osm a guarda uma vez."""
    south, west, north, east = bbox
    return [
        (
            _round(south + (north - south) * row / rows),
            _round(west + (east - west) * column / columns),
            _round(south + (north - south) * (row + 1) / rows),
            _round(west + (east - west) * (column + 1) / columns),
        )
        for row in range(rows)
        for column in range(columns)
    ]


# Só as relações do PDC e os ids dos seus membros: pequeno, sem geometria.
PDC_RELATIONS_QUERY = f"""[out:json][timeout:{RELATIONS_TIMEOUT_S}][maxsize:{MAX_SIZE}];
rel["source"="PDC/RMR"]["route"="bicycle"];
out body;"""


def ways_by_id_query(ids: list[int]) -> str:
    """A geometria de algumas vias pelo id: as do PDC, tenha sido construído algo nelas ou não."""
    return f"[out:json][timeout:{IDS_TIMEOUT_S}][maxsize:{MAX_SIZE}];\nway(id:{','.join(map(str, ids))});\nout tags geom;"


# Bicicletários e estações de bicicleta compartilhada. `out center` dá um ponto também para os mapeados como área.
RACKS_QUERY = f"""[out:json][timeout:120][bbox:{_bbox(RMR_BBOX)}];
(
  node["amenity"="bicycle_parking"];
  way["amenity"="bicycle_parking"];
);
out center tags;"""

# A rede Bike PE (operada pela Tembici): estações etiquetadas como aluguel de bicicleta.
STATIONS_QUERY = f"""[out:json][timeout:120][bbox:{_bbox(RMR_BBOX)}];
(
  node["amenity"="bicycle_rental"]["network"~"Bike ?PE",i];
  node["amenity"="bicycle_rental"]["operator"~"Tembici",i];
);
out center tags;"""

# ---------------------------------------------------------------------------
# Respostas
# ---------------------------------------------------------------------------


@dataclass
class Way:
    osm_id: int
    tags: dict[str, str]
    coordinates: list[list[float]]  # [lon, lat], a ordem do GeoJSON


@dataclass
class Relation:
    osm_id: int
    tags: dict[str, str]
    way_ids: list[int]


@dataclass
class OsmData:
    timestamp: str | None  # quando o OSM foi atualizado, segundo o Overpass
    relations: list[Relation] = field(default_factory=list)
    ways: list[Way] = field(default_factory=list)

    def to_json(self) -> dict:
        """O mesmo formato que o coletor em TypeScript gravava (os snapshots antigos continuam legíveis)."""
        return {
            "timestamp": self.timestamp,
            "relations": [{"osmId": r.osm_id, "tags": r.tags, "wayIds": r.way_ids} for r in self.relations],
            "ways": [{"osmId": w.osm_id, "tags": w.tags, "coordinates": w.coordinates} for w in self.ways],
        }

    @staticmethod
    def from_json(data: dict) -> "OsmData":
        return OsmData(
            data.get("timestamp"),
            [Relation(r["osmId"], r["tags"], r["wayIds"]) for r in data["relations"]],
            [Way(w["osmId"], w["tags"], w["coordinates"]) for w in data["ways"]],
        )


def _is_int(v) -> bool:
    return isinstance(v, int) and not isinstance(v, bool)


def _is_num(v) -> bool:
    return isinstance(v, (int, float)) and not isinstance(v, bool) and math.isfinite(v)


def _tags(v) -> dict[str, str] | None:
    """As tags de um elemento; None se alguma não for texto (o elemento é ignorado, como no zod do script antigo)."""
    if v is None:
        return {}
    if not isinstance(v, dict) or not all(isinstance(x, str) for x in v.values()):
        return None
    return dict(v)


def _timestamp(response: dict) -> str | None:
    osm3s = response.get("osm3s")
    ts = osm3s.get("timestamp_osm_base") if isinstance(osm3s, dict) else None
    return ts if isinstance(ts, str) else None


def parse_overpass(response) -> OsmData:
    if not isinstance(response, dict) or not isinstance(response.get("elements"), list):
        raise ValueError("Resposta do Overpass sem `elements`")
    # O Overpass responde 200 com um `remark` quando acabou o tempo ou a memória: os elementos vêm incompletos.
    if isinstance(response.get("remark"), str):
        raise ValueError(f"Overpass: {response['remark']}")
    data = OsmData(_timestamp(response))
    for el in response["elements"]:
        if not isinstance(el, dict) or not _is_int(el.get("id")):
            continue
        tags = _tags(el.get("tags"))
        if tags is None:
            continue
        if el.get("type") == "way":
            geometry = el.get("geometry", [])
            if not isinstance(geometry, list) or not all(isinstance(p, dict) and _is_num(p.get("lat")) and _is_num(p.get("lon")) for p in geometry):
                continue
            data.ways.append(Way(el["id"], tags, [[p["lon"], p["lat"]] for p in geometry]))
        elif el.get("type") == "relation":
            members = el.get("members", [])
            if not isinstance(members, list) or not all(isinstance(m, dict) and isinstance(m.get("type"), str) and _is_int(m.get("ref")) for m in members):
                continue
            data.relations.append(Relation(el["id"], tags, [m["ref"] for m in members if m["type"] == "way"]))
    return data


@dataclass
class Place:
    osm_id: str  # "node/123", "way/456"
    lat: float
    lon: float
    tags: dict[str, str]


def parse_places(response) -> tuple[list[Place], str | None]:
    """Resposta com `out center`: nó tem lat/lon; via e relação trazem `center`. Sem posição, fica de fora."""
    if not isinstance(response, dict) or not isinstance(response.get("elements"), list):
        raise ValueError("Resposta do Overpass sem `elements`")
    places = []
    for el in response["elements"]:
        if not isinstance(el, dict) or not isinstance(el.get("type"), str) or not _is_num(el.get("id")):
            continue
        center = el["center"] if isinstance(el.get("center"), dict) else el
        lat, lon = center.get("lat"), center.get("lon")
        if not _is_num(lat) or not _is_num(lon):
            continue
        tags = {k: v for k, v in el["tags"].items() if isinstance(v, str)} if isinstance(el.get("tags"), dict) else {}
        places.append(Place(f"{el['type']}/{_num(el['id'])}", lat, lon, tags))
    return places, _timestamp(response)


# ---------------------------------------------------------------------------
# Busca
# ---------------------------------------------------------------------------

# Instâncias públicas, nessa ordem. overpass-api.de vai por último: é a mais cheia e a de regras mais rígidas. Só ficam
# as que já responderam do servidor do Coolify (private.coffee e kumi.systems estouravam o tempo em toda tentativa).
OVERPASS_PRIMARY = "https://overpass-api.de/api/interpreter"
OVERPASS_ENDPOINTS = ("https://maps.mail.ru/osm/tools/overpass/api/interpreter", OVERPASS_PRIMARY)
# Os espelhos ou respondem logo ou não respondem: esperar o tempo todo por eles só atrasa a instância que funciona.
MIRROR_TIMEOUT_S = 45
DAY_S = 86_400
# O Overpass pede que clientes automáticos digam quem são.
USER_AGENT = "ameciclo-cycling-sync/1.0 (+https://ameciclo.org; weekly sync of the PDC/RMR cycling network)"

Log = Callable[[str], None]


def _log(message: str) -> None:
    print(f"{datetime.now(timezone.utc).isoformat(timespec='milliseconds').replace('+00:00', 'Z')} {message}", flush=True)


def post(endpoint: str, query: str, timeout_s: float, contact: str | None, user_agent: str = USER_AGENT) -> dict:
    headers = {"User-Agent": user_agent, "Content-Type": "application/x-www-form-urlencoded"}
    if contact:
        headers["From"] = contact
    body = urllib.parse.urlencode({"data": query}).encode()
    request = urllib.request.Request(endpoint, data=body, headers=headers, method="POST")
    with urllib.request.urlopen(request, timeout=timeout_s) as response:  # HTTP fora de 2xx vira HTTPError
        return json.load(response)


def _http_message(error: Exception) -> str:
    code = getattr(error, "code", None)
    return f"HTTP {code}" if code else str(error) or type(error).__name__


def parse_time(ts: str) -> float:
    return datetime.fromisoformat(ts.replace("Z", "+00:00")).timestamp()


def assert_fresh(data: OsmData, max_age_s: float, now: float | None = None) -> None:
    """Recusa a resposta cujo dado do OSM é mais velho que max_age_s."""
    if not data.timestamp:
        raise ValueError("Overpass não informou a data do OSM")
    age = (time.time() if now is None else now) - parse_time(data.timestamp)
    if not age <= max_age_s:
        raise ValueError(f"dado do OSM de {data.timestamp}, velho demais (limite {round(max_age_s / DAY_S)} dias)")


def fetch_overpass(
    query: str,
    *,
    endpoints=OVERPASS_ENDPOINTS,
    attempts_per_endpoint: int = 2,
    timeout_s: float = 120,
    max_age_s: float = 3 * DAY_S,
    contact: str | None = None,
    log: Log = lambda _: None,
) -> tuple[OsmData, str]:
    """A resposta da primeira instância que der um dado recente, e qual foi."""
    errors = []
    for endpoint in endpoints:
        for attempt in range(1, attempts_per_endpoint + 1):
            try:
                timeout = timeout_s if endpoint == OVERPASS_PRIMARY else min(timeout_s, MIRROR_TIMEOUT_S)
                data = parse_overpass(post(endpoint, query, timeout, contact))
                assert_fresh(data, max_age_s)
                log(f"{endpoint}: OSM de {data.timestamp}")
                return data, endpoint
            except Exception as error:  # noqa: BLE001 - qualquer falha passa para a próxima tentativa
                message = f"{endpoint} (tentativa {attempt}): {_http_message(error)}"
                errors.append(message)
                log(message)
                # Dado velho não fica novo perguntando de novo: vai para a próxima instância.
                if "velho demais" in str(error):
                    break
                if attempt < attempts_per_endpoint:
                    time.sleep(attempt * 5)
    raise RuntimeError("Overpass não respondeu:\n" + "\n".join(errors))


def fetch_places(query: str, *, contact: str | None = None, log: Log = lambda _: None, rounds: int = 4, pause_s: float = 20, timeout_s: float = 130):
    """Pontos (bicicletários, estações): várias rodadas pelas duas instâncias, com pausa entre elas, porque o Overpass
    público recusa boa parte das tentativas (502/504). Devolve (resposta bruta, pontos, data do OSM, instância)."""
    errors = []
    for round_ in range(1, rounds + 1):
        if round_ > 1:
            time.sleep(pause_s * (round_ - 1))
        for endpoint in OVERPASS_ENDPOINTS:
            try:
                raw = post(endpoint, query, timeout_s, contact, user_agent="ameciclo-observatorio/1.0 (https://ameciclo.org)")
                places, timestamp = parse_places(raw)
                log(f"{endpoint}: {len(places)} pontos (OSM de {timestamp})")
                return raw, places, timestamp, endpoint
            except Exception as error:  # noqa: BLE001
                message = f"{endpoint}: {_http_message(error)}"
                errors.append(message)
                log(message)
    raise RuntimeError("Overpass não respondeu:\n" + "\n".join(errors))


def merge_osm(parts: list[OsmData]) -> OsmData:
    """Pedaços do mesmo retrato como um só: cada via uma vez, a data mais antiga."""
    relations: dict[int, Relation] = {}
    ways: dict[int, Way] = {}
    for part in parts:
        for relation in part.relations:
            relations[relation.osm_id] = relation
        for way in part.ways:
            ways[way.osm_id] = way
    timestamps = sorted(p.timestamp for p in parts if p.timestamp is not None)
    return OsmData(timestamps[0] if timestamps else None, list(relations.values()), list(ways.values()))


# ---------------------------------------------------------------------------
# Regras
# ---------------------------------------------------------------------------

BY_SIDE_VALUE = {
    "track": "ciclovia",
    "lane": "ciclofaixa",
    "opposite_lane": "ciclofaixa",
    "shared_lane": "ciclorrota",
    "share_busway": "ciclorrota",
}


def built_typology(tags: dict[str, str], in_pdc: bool) -> str | None:
    """A tipologia construída numa via, pelas tags do OSM; None quando não há nenhuma.

    Vale o primeiro de cycleway, cycleway:left, cycleway:right e cycleway:both que disser algo; depois
    highway=cycleway. Calçada (footway, pedestrian) é "calçada compartilhada" quando permite bicicleta ou quando uma
    relação do PDC a designa. Dá a mesma resposta que o export do Atlas para as 4343 vias dele.
    """
    for side in SIDES:
        typology = BY_SIDE_VALUE.get(tags.get(side, ""))
        if typology:
            return typology
    highway = tags.get("highway")
    if highway == "cycleway":
        return "ciclovia"
    if highway in ("footway", "pedestrian") and (in_pdc or tags.get("bicycle") in ("yes", "designated")):
        return "calcada_compartilhada"
    return None


def way_geometry(way: Way) -> dict:
    """GeoJSON da via: uma linha, ou um polígono quando ela fecha em si mesma e é uma área."""
    c = way.coordinates
    closed = len(c) > 3 and c[0] == c[-1]
    if closed and way.tags.get("area") == "yes":
        return {"type": "Polygon", "coordinates": [c]}
    return {"type": "LineString", "coordinates": c}


def relation_ref(tags: dict[str, str]) -> str | None:
    """O código do projeto ("CM01") de uma relação do PDC."""
    ref = (tags.get("ref") or "").strip()
    if ref:
        return ref
    match = re.search(r"CÓD \(PDC/RMR\):\s*([A-Z0-9]+)", tags.get("description") or "")
    return match.group(1) if match else None


def _yes_no(value: str | None) -> bool | None:
    if value is None:
        return None
    if value in ("yes", "true", "1", "-1"):
        return True
    if value in ("no", "false", "0"):
        return False
    return None


def way_tags(tags: dict[str, str]) -> dict:
    """As tags que viram colunas em cycling_way."""
    maxspeed = tags.get("maxspeed")
    return {
        "surface": tags.get("surface"),
        "oneway": _yes_no(tags.get("oneway")),
        "maxspeed_kmh": int(maxspeed) if maxspeed and re.fullmatch(r"\d{1,3}", maxspeed) else None,
        "lit": _yes_no(tags.get("lit")),
    }
