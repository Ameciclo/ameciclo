"""Infraestrutura cicloviária da RMR a partir do OpenStreetMap, toda semana (alimenta /dados/execucaocicloviaria).

    python -m ingest.osm_ciclovias                       coleta no Overpass, confere e grava (DRY_RUN=true desfaz no fim)
    python -m ingest.osm_ciclovias --snapshot PREFIXO    aplica um retrato já coletado, sem perguntar ao Overpass
    python -m ingest.osm_ciclovias --so-coletar          só coleta e confere (o Kestra grava num segundo passo)

Porte de apps/collector/src/collect.ts e packages/db/src/cycling/{manifest,sync}.ts, com o mesmo comportamento:

1. Pergunta ao Overpass em pedaços pequenos (cada um com retry próprio; o Overpass público recusa metade das
   tentativas em dia ruim): as relações do PDC, a geometria das vias delas e toda via com infraestrutura, por pedaço
   do mapa. Cada resposta vai para o lago (raw/osm/ciclovias/<prefixo>/), e para o R2 se ele estiver configurado.
2. Confere se veio tudo e se o dado é recente. Se não, não grava nada.
3. Grava numa transação (sync): o OSM é dono das vias, da geometria, das tags e de qual relação do PDC cada uma faz
   parte. O catálogo do PDC (etapa, km planejados, tipologia) é nosso e do admin: nunca é criado aqui, só se relatam
   relações desconhecidas. O que alguém escolheu à mão fica: cidade com city_manual e vínculos com manual.
   Cada execução deixa uma linha em cycling_sync_run e um cycling_summary_snapshot por cidade (aparece no admin, em
   /infra/sincronizacoes).

Variáveis: ENVIRONMENT (staging ou production), DATABASE_URL, DRY_RUN; opcionais OVERPASS_CONTACT, R2_ACCOUNT_ID,
R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, KUMA_PUSH_URL.
"""

import argparse
import json
import os
import re
import secrets
import sys
import time
import urllib.parse
import urllib.request
from datetime import datetime, timezone

from psycopg.types.json import Jsonb

from . import db, lake
from .overpass import (
    DAY_S,
    PDC_RELATIONS_QUERY,
    OsmData,
    _log as log,
    built_typology,
    fetch_overpass,
    infrastructure_query,
    infrastructure_tiles,
    merge_osm,
    parse_time,
    relation_ref,
    way_geometry,
    way_tags,
    ways_by_id_query,
)

FONTE = "osm.ciclovias"
# Vias pedidas por id numa consulta.
WAYS_PER_QUERY = 400
# Cada pedaço tem até 10 tentativas, esperando cada vez mais (30 s até 15 min) antes de a execução desistir: uma
# semana é muito tempo até a próxima.
ATTEMPTS = 10
BASE_WAIT_S = 30
MAX_WAIT_S = 15 * 60
# Aconteça o que acontecer, a execução termina: uma noite travada não pode segurar o servidor por dias.
DEADLINE_S = 6 * 60 * 60
SNAPSHOT_PREFIX = re.compile(r"^(production|staging)/\d{4}-\d{2}-\d{2}/[0-9a-f]{8}$")

# Menos vias do PDC do que essa fração das que as relações listam = resposta parcial.
MIN_PDC_WAYS_SHARE = 0.9
# Uma execução que tiraria mais que isso das vias é quase certamente resposta parcial do Overpass.
MAX_REMOVED_SHARE = 0.2
# Menos relações do PDC do que essa fração das que conhecemos: mesma suspeita.
MIN_RELATIONS_SHARE = 0.9
BATCH = 200


def _required(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        raise SystemExit(f"Falta a variável {name}")
    return value


def _optional(name: str) -> str | None:
    # Variável que não existe no container do Dagu chega como o texto literal "${NOME}".
    value = os.environ.get(name)
    return value if value and not value.startswith("${") else None


# ---------------------------------------------------------------------------
# R2 (opcional): o histórico do que o OSM dizia, semana a semana
# ---------------------------------------------------------------------------


class R2:
    def __init__(self):
        import boto3  # só quem usa o R2 precisa

        self.bucket = _optional("R2_BUCKET") or "ameciclo-cycling-osm"
        self.client = boto3.client(
            "s3",
            endpoint_url=f"https://{_required('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com",
            aws_access_key_id=_required("R2_ACCESS_KEY_ID"),
            aws_secret_access_key=_required("R2_SECRET_ACCESS_KEY"),
            region_name="auto",
        )

    def put_json(self, key: str, value) -> None:
        self.client.put_object(Bucket=self.bucket, Key=key, Body=json.dumps(value).encode(), ContentType="application/json")


# ---------------------------------------------------------------------------
# Manifesto: onde está cada pedaço e se o conjunto serve
# ---------------------------------------------------------------------------


def manifest_parts(manifest: dict) -> list[dict]:
    return [manifest["relations"], *manifest["pdcWays"], *manifest["infrastructure"]]


def manifest_problems(manifest: dict, now: float | None = None, max_age_s: float = 3 * DAY_S) -> list[str]:
    """O que torna o retrato impróprio para gravar; vazio quando está bom."""
    now = time.time() if now is None else now
    problems = []
    if manifest["relations"]["relations"] == 0:
        problems.append("nenhuma relação do PDC")
    got = sum(p["ways"] for p in manifest["pdcWays"])
    if got < manifest["pdcWayIds"] * MIN_PDC_WAYS_SHARE:
        problems.append(f"só {got} dos {manifest['pdcWayIds']} trechos do PDC")
    if not manifest["infrastructure"] or all(p["ways"] == 0 for p in manifest["infrastructure"]):
        problems.append("nenhum trecho de infraestrutura")
    for part in manifest_parts(manifest):
        ts = part.get("timestamp")
        if not ts or not now - parse_time(ts) <= max_age_s:
            problems.append(f"{part['key']}: dado do OSM de {ts or 'data desconhecida'}, velho demais")
    return problems


# ---------------------------------------------------------------------------
# Coleta
# ---------------------------------------------------------------------------


def _with_retries(fn, name: str):
    for attempt in range(1, ATTEMPTS + 1):
        try:
            return fn()
        except Exception as error:  # noqa: BLE001
            log(f"{name}, tentativa {attempt}: {error}")
            if attempt == ATTEMPTS:
                raise
            time.sleep(min(BASE_WAIT_S * 2 ** (attempt - 1), MAX_WAIT_S))


def coletar(prefix: str, r2: R2 | None) -> tuple[dict, list[OsmData]]:
    started = time.time()
    contact = _optional("OVERPASS_CONTACT")

    def collect(name: str, query: str) -> tuple[dict, OsmData]:
        def once():
            if time.time() > started + DEADLINE_S:
                raise RuntimeError("Passou do prazo de 6 horas; a coleta foi abandonada")
            data, endpoint = fetch_overpass(query, attempts_per_endpoint=1, contact=contact, log=log)
            key = f"{prefix}/{name}.json"
            lake.write_json(FONTE, key, data.to_json())
            if r2:
                r2.put_json(key, data.to_json())
            log(f"{name}: {len(data.relations)} relações, {len(data.ways)} trechos (OSM de {data.timestamp})")
            part = {"key": key, "timestamp": data.timestamp, "endpoint": endpoint, "relations": len(data.relations), "ways": len(data.ways)}
            return part, data

        return _with_retries(once, name)

    # 1. As relações do PDC e, com elas, quais vias fazem parte do plano.
    relations, relations_data = collect("pdc-relacoes", PDC_RELATIONS_QUERY)
    way_ids = sorted({way_id for r in relations_data.relations for way_id in r.way_ids})
    # 2. A geometria delas, algumas centenas por vez (uma consulta por vez: o Overpass recusa simultâneas).
    chunks = [way_ids[i : i + WAYS_PER_QUERY] for i in range(0, len(way_ids), WAYS_PER_QUERY)]
    pdc_ways = [collect(f"pdc-trechos-{i + 1}", ways_by_id_query(ids)) for i, ids in enumerate(chunks)]
    # 3. Tudo que tem infraestrutura cicloviária, por pedaço da RMR.
    infra = [collect(f"infra-{i + 1}", infrastructure_query(tile)) for i, tile in enumerate(infrastructure_tiles())]

    manifest = {
        "version": 1,
        "prefix": prefix,
        "collectedAt": datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z"),
        "pdcWayIds": len(way_ids),
        "relations": relations,
        "pdcWays": [p for p, _ in pdc_ways],
        "infrastructure": [p for p, _ in infra],
    }
    pieces = [relations_data, *(d for _, d in pdc_ways), *(d for _, d in infra)]
    lake.write_json(FONTE, f"{prefix}/manifest.json", manifest)
    if r2:
        r2.put_json(f"{prefix}/manifest.json", manifest)
    log(f"Retrato guardado em {lake.snapshot_dir(FONTE) / prefix}. Para aplicar de novo sem buscar: --snapshot {prefix}")
    return manifest, pieces


def ler_snapshot(prefix: str) -> tuple[dict, list[OsmData]]:
    manifest = lake.read_json(FONTE, f"{prefix}/manifest.json")
    return manifest, [OsmData.from_json(lake.read_json(FONTE, part["key"])) for part in manifest_parts(manifest)]


# ---------------------------------------------------------------------------
# Gravação
# ---------------------------------------------------------------------------


class DryRun(Exception):
    pass


def _chunks(items: list):
    for i in range(0, len(items), BATCH):
        yield items[i : i + BATCH]


UPSERT_WAYS = """
insert into cycling_way (osm_id, name, highway, geom, has_cycleway, built_typology_key, dual_carriageway, tags,
                         surface, oneway, maxspeed_kmh, lit, removed_at, last_seen_run_id, first_seen_run_id)
select osm_id, name, highway, ST_SetSRID(ST_GeomFromGeoJSON(geom), 4326), has_cycleway, built_typology_key,
       dual_carriageway, tags, surface, oneway, maxspeed_kmh, lit, null, %(run)s, %(run)s
from jsonb_to_recordset(%(rows)s) as x(osm_id bigint, name text, highway text, geom text, has_cycleway boolean,
     built_typology_key text, dual_carriageway boolean, tags jsonb, surface text, oneway boolean,
     maxspeed_kmh smallint, lit boolean)
on conflict (osm_id) do update set
  name = excluded.name, highway = excluded.highway, geom = excluded.geom, has_cycleway = excluded.has_cycleway,
  built_typology_key = excluded.built_typology_key, dual_carriageway = excluded.dual_carriageway,
  tags = excluded.tags, surface = excluded.surface, oneway = excluded.oneway, maxspeed_kmh = excluded.maxspeed_kmh,
  lit = excluded.lit, removed_at = null, last_seen_run_id = excluded.last_seen_run_id, updated_at = now()
returning (xmax = 0)
"""

# Cidade: a que contém o meio da via, a não ser que o admin tenha escolhido.
SET_CITY = """
update cycling_way w set city_ibge = (
  select c.ibge_code from cycling_city c
  where ST_Contains(c.boundary, case when GeometryType(w.geom) = 'LINESTRING'
                                     then ST_LineInterpolatePoint(w.geom, 0.5)
                                     else ST_PointOnSurface(w.geom) end)
  limit 1)
where w.last_seen_run_id = %s and not w.city_manual
"""


def sync(conn, pdc: OsmData, infrastructure: OsmData, triggered_by: str, dry_run: bool) -> dict:
    """Uma transação; com dry_run, desfeita no fim (inclusive a linha de cycling_sync_run)."""
    timestamps = sorted(t for t in (pdc.timestamp, infrastructure.timestamp) if t is not None)
    osm_timestamp = timestamps[0] if timestamps else None
    try:
        with conn.transaction(), conn.cursor() as cur:
            cur.execute("select id, ref, osm_relation_id from cycling_pdc_project")
            catalog = cur.fetchall()
            if not catalog:
                raise RuntimeError("O catálogo do PDC está vazio: rode db:import-ciclo-infra antes de sincronizar com o OSM.")
            project_of_ref = {ref: id_ for id_, ref, _ in catalog}

            # Relações do OSM, ligadas ao catálogo pelo código.
            known = []
            for relation in pdc.relations:
                ref = relation_ref(relation.tags)
                if ref and ref in project_of_ref:
                    known.append((relation, ref, project_of_ref[ref]))
            known_refs = {ref for _, ref, _ in known}
            unknown_relations = []
            for relation in pdc.relations:
                ref = relation_ref(relation.tags)
                if not (ref and ref in known_refs):
                    unknown_relations.append(ref or f"relation/{relation.osm_id}")
            missing_relations = [ref for _, ref, rel_id in catalog if rel_id is not None and ref not in known_refs]

            with_relation = sum(1 for *_, rel_id in catalog if rel_id is not None)
            if len(known) < with_relation * MIN_RELATIONS_SHARE:
                raise RuntimeError(
                    f"Overpass trouxe {len(known)} das {with_relation} relações do PDC conhecidas: resposta incompleta, nada foi gravado."
                )

            cur.execute(
                "insert into cycling_sync_run (kind, source_ref, triggered_by) values ('osm', %s, %s) returning id",
                (f"overpass, OSM de {osm_timestamp or 'data desconhecida'}", triggered_by),
            )
            (run_id,) = cur.fetchone()

            # Vias: as do PDC (mesmo onde nada foi construído) e toda via com infraestrutura, cada uma uma vez.
            in_pdc = {way_id for relation, _, _ in known for way_id in relation.way_ids}
            way_of_id = {w.osm_id: w for w in infrastructure.ways}
            for way in pdc.ways:
                way_of_id[way.osm_id] = way
            ways = [w for w in way_of_id.values() if len(w.coordinates) >= 2]

            added = updated = 0
            for batch in _chunks(ways):
                rows = []
                for w in batch:
                    typology = built_typology(w.tags, w.osm_id in in_pdc)
                    rows.append({
                        "osm_id": w.osm_id,
                        "name": w.tags.get("name"),
                        "highway": w.tags.get("highway"),
                        "geom": json.dumps(way_geometry(w)),
                        "has_cycleway": typology is not None,
                        "built_typology_key": typology,
                        # Pista dupla: o OSM a mapeia como duas linhas, o plano a conta uma vez.
                        "dual_carriageway": w.tags.get("dual_carriageway") == "yes",
                        "tags": w.tags,
                        **way_tags(w.tags),
                    })
                cur.execute(UPSERT_WAYS, {"run": run_id, "rows": Jsonb(rows)})
                for (inserted,) in cur.fetchall():
                    if inserted:
                        added += 1
                    else:
                        updated += 1

            cur.execute(SET_CITY, (run_id,))

            # Vias novas fora dos 14 municípios e fora do PDC: não são nossas.
            cur.execute(
                """delete from cycling_way where first_seen_run_id = %s and city_ibge is null
                   and not (osm_id = any(%s::bigint[])) returning id""",
                (run_id, list(in_pdc)),
            )
            outside = len(cur.fetchall())
            added -= outside

            # As tags das relações (nome, situação, responsável) vão junto com o projeto.
            for relation, _, project_id in known:
                cur.execute(
                    "update cycling_pdc_project set osm_relation_id = %s, osm_tags = %s, updated_at = now() where id = %s",
                    (relation.osm_id, Jsonb(relation.tags), project_id),
                )

            # Vínculos via ↔ projeto seguem os membros das relações; os manuais ficam.
            cur.execute("select id, osm_id from cycling_way")
            way_id_of = {osm_id: id_ for id_, osm_id in cur.fetchall()}
            wanted: dict[tuple[int, int], None] = {}
            for relation, _, project_id in known:
                for osm_id in relation.way_ids:
                    if osm_id in way_id_of:
                        wanted[(way_id_of[osm_id], project_id)] = None
            cur.execute("select way_id, project_id, manual from cycling_way_project")
            current = cur.fetchall()
            stale = [(w, p) for w, p, manual in current if not manual and (w, p) not in wanted]
            have = {(w, p) for w, p, _ in current}
            missing = [link for link in wanted if link not in have]
            for batch in _chunks(stale):
                cur.execute(
                    "delete from cycling_way_project where (way_id, project_id) in (select * from unnest(%s::int[], %s::int[]))",
                    ([w for w, _ in batch], [p for _, p in batch]),
                )
            for batch in _chunks(missing):
                cur.execute(
                    """insert into cycling_way_project (way_id, project_id)
                       select * from unnest(%s::int[], %s::int[]) on conflict do nothing""",
                    ([w for w, _ in batch], [p for _, p in batch]),
                )

            # Vias que sumiram do OSM ficam no banco, fora dos números.
            cur.execute("select count(*)::int from cycling_way where removed_at is null and last_seen_run_id <> %s", (run_id,))
            (gone,) = cur.fetchone()
            cur.execute("select count(*)::int from cycling_way where removed_at is null")
            (total,) = cur.fetchone()
            if gone > (total or 1) * MAX_REMOVED_SHARE:
                raise RuntimeError(f"{gone} de {total} trechos sumiriam do OSM de uma vez: resposta suspeita, nada foi gravado.")
            cur.execute(
                "update cycling_way set removed_at = now() where last_seen_run_id <> %s and removed_at is null returning id",
                (run_id,),
            )
            removed = len(cur.fetchall())

            # O resumo desta execução, por cidade: como os números mudam com o tempo.
            cur.execute(
                """insert into cycling_summary_snapshot (run_id, city_ibge, pdc_realizado_designado_km,
                     pdc_realizado_nao_designado_km, realizado_fora_pdc_km, pdc_nao_realizado_km, planned_km)
                   select %s, city_ibge, pdc_realizado_designado_km, pdc_realizado_nao_designado_km,
                     realizado_fora_pdc_km, pdc_nao_realizado_km,
                     pdc_realizado_designado_km + pdc_realizado_nao_designado_km + pdc_nao_realizado_km
                   from cycling_city_summary""",
                (run_id,),
            )
            cur.execute(
                """update cycling_sync_run set status = 'success', finished_at = now(), ways_added = %s,
                   ways_updated = %s, ways_removed = %s where id = %s""",
                (added, updated, removed, run_id),
            )

            summary = {
                "runId": run_id,
                "osmTimestamp": osm_timestamp,
                "added": added,
                "updated": updated,
                "removed": removed,
                "outsideRmr": outside,
                "links": {"added": len(missing), "removed": len(stale)},
                "unknownRelations": unknown_relations,
                "missingRelations": missing_relations,
            }
            if dry_run:
                raise DryRun(summary)  # desfaz tudo
            return summary
    except DryRun as dry:
        return dry.args[0]


# ---------------------------------------------------------------------------


def heartbeat(status: str, message: str) -> None:
    """Um monitor Push do uptime-kuma avisa alguém quando passa uma semana sem sucesso."""
    url = _optional("KUMA_PUSH_URL")
    if not url:
        return
    # A URL que o Kuma mostra já termina em "?status=up&msg=OK&ping=": troca a query inteira pela nossa.
    parts = urllib.parse.urlsplit(url)
    query = urllib.parse.urlencode({"status": status, "msg": message[:200]})
    try:
        urllib.request.urlopen(urllib.parse.urlunsplit(parts._replace(query=query)), timeout=20).close()
    except Exception:  # noqa: BLE001 - o aviso nunca derruba a execução
        pass


def run(snapshot: str | None, dry_run: bool, only_collect: bool = False) -> dict | None:
    environment = _required("ENVIRONMENT")
    if environment not in ("production", "staging"):
        raise SystemExit(f"ENVIRONMENT inválido: {environment}")
    r2 = R2() if _optional("R2_ACCOUNT_ID") else None
    if snapshot and not (SNAPSHOT_PREFIX.match(snapshot) and snapshot.startswith(f"{environment}/")):
        raise SystemExit(f"--snapshot inválido para {environment}: {snapshot}")
    prefix = snapshot or f"{environment}/{datetime.now(timezone.utc):%Y-%m-%d}/{secrets.token_hex(4)}"
    log(f"{'Aplicando o retrato' if snapshot else 'Coleta'} {prefix}{' (dry run)' if dry_run else ''}{'' if r2 else ' (sem R2)'}")

    # Já coletado (e conferido logo abaixo): desta vez sem Overpass.
    manifest, pieces = ler_snapshot(prefix) if snapshot else coletar(prefix, r2)

    # 4. Veio tudo, e é recente? Senão, nada é gravado.
    problems = manifest_problems(manifest)
    if problems:
        raise RuntimeError(f"Dados incompletos ou velhos, nada foi gravado: {'; '.join(problems)}")
    if only_collect:
        # Para o Kestra: o próximo passo recebe o prefixo como saída e grava com --snapshot.
        print("::" + json.dumps({"outputs": {"snapshot": prefix}}) + "::", flush=True)
        return None

    # 5. Uma transação. Os pedaços são [relações, ...vias do PDC, ...pedaços da infraestrutura].
    n_pdc = 1 + len(manifest["pdcWays"])
    with db.connect() as conn:
        summary = sync(conn, merge_osm(pieces[:n_pdc]), merge_osm(pieces[n_pdc:]), f"coletor {prefix}", dry_run)
    if r2:
        r2.put_json(f"{prefix}/resumo.json", {"dryRun": dry_run, **summary})
    log(f"{'Dry run: nada foi gravado. ' if dry_run else ''}{json.dumps(summary, ensure_ascii=False)}")
    return summary


def main() -> int:
    parser = argparse.ArgumentParser(prog="python -m ingest.osm_ciclovias")
    parser.add_argument("--snapshot", help="prefixo de um retrato já no lago (ambiente/AAAA-MM-DD/xxxxxxxx); vazio = coletar")
    parser.add_argument("--dry-run", action="store_true", help="desfaz a transação no fim (também DRY_RUN=true)")
    parser.add_argument("--so-coletar", action="store_true", help="só coleta e confere; grava depois com --snapshot")
    args = parser.parse_args()
    dry_run = args.dry_run or os.environ.get("DRY_RUN") == "true"
    try:
        run(args.snapshot, dry_run, args.so_coletar)
        if args.so_coletar:
            return 0  # o sucesso (ou não) da sincronização é avisado pelo passo que grava
    except BaseException as error:
        heartbeat("down", str(error))
        raise
    # Dry run não é sucesso da sincronização: dizer, ou um DRY_RUN=true esquecido pareceria bem por semanas.
    heartbeat("up", "dry run concluido (nada foi gravado)" if dry_run else "coleta concluida")
    return 0


if __name__ == "__main__":
    sys.exit(main())
