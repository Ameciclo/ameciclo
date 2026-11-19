"""Bicicletários e estações de Bike PE da RMR, do OpenStreetMap (camadas do mapa de /dados/ciclodados).

    python -m ingest.osm_lugares             busca no Overpass e substitui bicycle_rack e bike_share_station
    python -m ingest.osm_lugares --dry-run   só busca e relata (também DRY_RUN=true)

Porte de packages/db/scripts/import-osm-lugares.ts. As tabelas são um retrato do OSM: cada execução as substitui por
inteiro numa transação (desfeita se a contagem final não bater). Se o Overpass devolver muito menos do que o esperado
(uma consulta que falhou em silêncio), nada é gravado. As respostas ficam no lago (raw/osm/lugares/).
"""

import argparse
import json
import os
import re
import sys
import tempfile
from dataclasses import dataclass
from pathlib import Path

from psycopg.types.json import Jsonb

from . import db, lake
from .overpass import RACKS_QUERY, STATIONS_QUERY, Place, _log as log, fetch_places

FONTE = "osm.lugares"
# Abaixo disso, a resposta não pode ser a região inteira (hoje há centenas de bicicletários e dezenas de estações).
MIN_RACKS = 50
MIN_STATIONS = 10
BATCH = 500


def _text(v: str | None) -> str | None:
    return v.strip() if v and v.strip() else None


def _count(v: str | None) -> int | None:
    # "20" vira 20; "10;5" ou "muitas" ficam sem número (a etiqueta continua em `tags`).
    return int(v.strip()) if v and re.fullmatch(r"\d{1,5}", v.strip()) else None


@dataclass
class Rack:
    osm_id: str
    name: str | None
    capacity: int | None
    covered: str | None
    access: str | None
    operator: str | None
    parking_type: str | None
    lon: float
    lat: float
    tags: dict[str, str]


@dataclass
class Station:
    osm_id: str
    name: str | None
    ref: str | None
    capacity: int | None
    network: str | None
    operator: str | None
    lon: float
    lat: float
    tags: dict[str, str]


def to_rack(p: Place) -> Rack:
    t = p.tags
    return Rack(p.osm_id, _text(t.get("name")), _count(t.get("capacity")), _text(t.get("covered")), _text(t.get("access")),
                _text(t.get("operator")), _text(t.get("bicycle_parking")), p.lon, p.lat, t)


def to_station(p: Place) -> Station:
    t = p.tags
    return Station(p.osm_id, _text(t.get("name")), _text(t.get("ref")), _count(t.get("capacity")), _text(t.get("network")),
                   _text(t.get("operator")), p.lon, p.lat, t)


def _fetch(name: str, query: str, contact: str | None) -> list[Place]:
    raw, places, _, endpoint = fetch_places(query, contact=contact, log=log)
    with tempfile.TemporaryDirectory() as tmp:
        path = Path(tmp) / f"{name}.json"
        path.write_text(json.dumps(raw, ensure_ascii=False))
        entry, _ = lake.put(FONTE, name, path, endpoint)
    log(f"{name}: guardado em {entry.arquivo}")
    return places


def _insert(cur, sql: str, rows: list[tuple]) -> None:
    for i in range(0, len(rows), BATCH):
        cur.executemany(sql, rows[i : i + BATCH])


def gravar(racks: list[Rack], stations: list[Station]) -> None:
    with db.connect() as conn, conn.transaction(), conn.cursor() as cur:
        cur.execute("delete from bicycle_rack")
        cur.execute("delete from bike_share_station")
        _insert(
            cur,
            """insert into bicycle_rack (osm_id, name, capacity, covered, access, operator, parking_type, geom, tags)
               values (%s, %s, %s, %s, %s, %s, %s, ST_SetSRID(ST_MakePoint(%s, %s), 4326), %s)""",
            [(r.osm_id, r.name, r.capacity, r.covered, r.access, r.operator, r.parking_type, r.lon, r.lat, Jsonb(r.tags)) for r in racks],
        )
        _insert(
            cur,
            """insert into bike_share_station (osm_id, name, ref, capacity, network, operator, geom, tags)
               values (%s, %s, %s, %s, %s, %s, ST_SetSRID(ST_MakePoint(%s, %s), 4326), %s)""",
            [(s.osm_id, s.name, s.ref, s.capacity, s.network, s.operator, s.lon, s.lat, Jsonb(s.tags)) for s in stations],
        )
        cur.execute("select (select count(*) from bicycle_rack), (select count(*) from bike_share_station)")
        r, s = cur.fetchone()
        if r != len(racks) or s != len(stations):
            raise RuntimeError(f"gravei {r} bicicletários e {s} estações, esperava {len(racks)} e {len(stations)}")


def main() -> int:
    parser = argparse.ArgumentParser(prog="python -m ingest.osm_lugares")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    dry_run = args.dry_run or os.environ.get("DRY_RUN") == "true"
    contact = os.environ.get("OVERPASS_CONTACT")
    contact = contact if contact and not contact.startswith("${") else None

    racks = [to_rack(p) for p in _fetch("bicicletarios", RACKS_QUERY, contact)]
    stations = [to_station(p) for p in _fetch("estacoes", STATIONS_QUERY, contact)]
    with_capacity = lambda rows: sum(1 for r in rows if r.capacity is not None)  # noqa: E731
    print(f"{len(racks)} bicicletários ({with_capacity(racks)} com número de vagas); "
          f"{len(stations)} estações de Bike PE ({with_capacity(stations)} com capacidade)")
    if len(racks) < MIN_RACKS or len(stations) < MIN_STATIONS:
        raise SystemExit(f"Poucos pontos ({len(racks)} bicicletários, {len(stations)} estações): nada foi gravado.")
    if dry_run:
        print("Dry run: nada foi gravado.")
        return 0
    gravar(racks, stations)
    print("Importação concluída.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
