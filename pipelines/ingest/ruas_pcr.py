"""Trechos de logradouros do Recife (Prefeitura, dados abertos) em street_segment: dão a extensão (km) e o traçado das
vias do ranking de vias inseguras (/dados/viasinseguras).

    python -m ingest.ruas_pcr --url https://...        baixa o GeoJSON e substitui a tabela
    python -m ingest.ruas_pcr --arquivo caminho.geojson   lê um arquivo local
    python -m ingest.ruas_pcr ... --dry-run              só lê e relata

Porte de packages/db/scripts/import-ruas-pcr.ts. A tabela é um retrato do arquivo: cada execução a substitui por
inteiro numa transação (desfeita se a contagem final não bater). O arquivo vai para o lago (raw/prefeitura/ruas/).
"""

import argparse
import json
import math
import sys
import tempfile
import unicodedata
import urllib.request
from dataclasses import dataclass
from pathlib import Path

from . import db, lake

FONTE = "prefeitura.ruas"
BATCH = 500


def name_key(value: str) -> str:
    """Mesma regra de nome do SAMU: sem acento, maiúsculas, espaços colapsados."""
    without_accents = "".join(c for c in unicodedata.normalize("NFD", value) if not unicodedata.combining(c))
    return " ".join(without_accents.upper().split())


def _text(v) -> str | None:
    return v.strip() if isinstance(v, str) and v.strip() else None


def _int(v) -> int | None:
    return math.trunc(v) if isinstance(v, (int, float)) and not isinstance(v, bool) and math.isfinite(v) else None


@dataclass
class Segment:
    source_id: int
    street_code: int
    name_key: str
    official_name: str | None
    paved: str | None
    length_m: float
    geometry: str  # GeoJSON (MultiLineString) como texto, para ST_GeomFromGeoJSON


def to_segment(feature: dict) -> Segment | str:
    """O trecho, ou o motivo de ficar de fora."""
    p = feature.get("properties") or {}
    source_id, street_code, name = _int(p.get("OBJECTID")), _int(p.get("CLOGRACODI")), _text(p.get("NLOGRACONC"))
    length = p.get("DB2GSE.Sde")
    if source_id is None or street_code is None or not name:
        return "sem OBJECTID, código ou nome do logradouro"
    if not isinstance(length, (int, float)) or isinstance(length, bool) or not math.isfinite(length) or length < 0:
        return "sem comprimento"
    g = feature.get("geometry")
    if not isinstance(g, dict) or g.get("type") != "MultiLineString" or not isinstance(g.get("coordinates"), list) or not g["coordinates"]:
        return "geometria que não é MultiLineString"
    return Segment(source_id, street_code, name_key(name), _text(p.get("NLGPAVOFIC")), _text(p.get("INDPAV")), length,
                   json.dumps({"type": "MultiLineString", "coordinates": g["coordinates"]}))


def ler(url: str | None, arquivo: Path | None) -> list[dict]:
    with tempfile.TemporaryDirectory() as tmp:
        if url:
            arquivo = Path(tmp) / "trechos-de-logradouros.geojson"
            with urllib.request.urlopen(url, timeout=120) as response, arquivo.open("wb") as f:
                f.write(response.read())
        assert arquivo is not None
        entry, changed = lake.put(FONTE, "trechos", arquivo, url or f"arquivo local: {arquivo}")
        print(f"{'arquivo novo' if changed else 'igual ao anterior'} -> {entry.arquivo}")
        features = json.loads(arquivo.read_text()).get("features")
    if not isinstance(features, list) or not features:
        raise SystemExit("o arquivo não tem features")
    return features


def main() -> int:
    parser = argparse.ArgumentParser(prog="python -m ingest.ruas_pcr")
    source = parser.add_mutually_exclusive_group(required=True)
    source.add_argument("--url")
    source.add_argument("--arquivo", type=Path)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    features = ler(args.url, args.arquivo)
    segments: list[Segment] = []
    skipped: dict[str, int] = {}
    seen: set[int] = set()
    for feature in features:
        r = to_segment(feature)
        if isinstance(r, str):
            skipped[r] = skipped.get(r, 0) + 1
        elif r.source_id in seen:
            skipped["OBJECTID repetido"] = skipped.get("OBJECTID repetido", 0) + 1
        else:
            seen.add(r.source_id)
            segments.append(r)
    streets = len({s.name_key for s in segments})
    km = sum(s.length_m for s in segments) / 1000
    print(f"{len(segments)} de {len(features)} trechos; {streets} nomes de logradouro; {km:.0f} km")
    for reason, n in skipped.items():
        print(f"  descartados ({reason}): {n}")
    if args.dry_run:
        print("Dry run: nada foi gravado.")
        return 0

    with db.connect() as conn, conn.transaction(), conn.cursor() as cur:
        cur.execute("delete from street_segment")
        rows = [(s.source_id, s.street_code, s.name_key, s.official_name, s.paved, s.length_m, s.geometry) for s in segments]
        for i in range(0, len(rows), BATCH):
            cur.executemany(
                """insert into street_segment (source_id, street_code, name_key, official_name, paved, length_m, geom)
                   values (%s, %s, %s, %s, %s, %s, ST_SetSRID(ST_GeomFromGeoJSON(%s), 4326))""",
                rows[i : i + BATCH],
            )
        cur.execute("select count(*) from street_segment")
        (n,) = cur.fetchone()
        if n != len(segments):
            raise RuntimeError(f"gravei {n}, esperava {len(segments)}")
    print(f"{len(segments)} trechos gravados.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
