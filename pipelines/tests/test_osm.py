"""Portados de packages/db/src/{cycling/osm,cycling/manifest,places/places,streets/transform}.test.ts."""

import pytest

from ingest.osm_ciclovias import manifest_problems
from ingest.osm_lugares import to_rack, to_station
from ingest.overpass import (
    INFRA_VALUES,
    PDC_RELATIONS_QUERY,
    RACKS_QUERY,
    RMR_BBOX,
    SIDES,
    OsmData,
    Relation,
    Way,
    assert_fresh,
    built_typology,
    infrastructure_query,
    infrastructure_tiles,
    merge_osm,
    parse_overpass,
    parse_places,
    parse_time,
    relation_ref,
    way_geometry,
    way_tags,
    ways_by_id_query,
)
from ingest.ruas_pcr import name_key, to_segment

DAY = 86_400
INFRASTRUCTURE_QUERY = infrastructure_query()


class TestBuiltTypology:
    def test_reads_the_cycleway_tags_of_the_street(self):
        assert built_typology({"highway": "primary", "cycleway:right": "track"}, False) == "ciclovia"
        assert built_typology({"highway": "secondary", "cycleway:left": "lane"}, False) == "ciclofaixa"
        assert built_typology({"highway": "tertiary", "cycleway": "opposite_lane"}, False) == "ciclofaixa"
        assert built_typology({"highway": "residential", "cycleway": "shared_lane"}, False) == "ciclorrota"
        assert built_typology({"highway": "residential", "cycleway": "share_busway"}, False) == "ciclorrota"

    def test_takes_the_first_side_that_says_something(self):
        assert built_typology({"highway": "residential", "cycleway:left": "shared_lane", "cycleway:right": "lane"}, False) == "ciclorrota"
        assert built_typology({"highway": "secondary", "cycleway:left": "lane", "cycleway:right": "shared_lane"}, False) == "ciclofaixa"

    def test_separate_path_is_a_ciclovia(self):
        assert built_typology({"highway": "cycleway"}, False) == "ciclovia"
        assert built_typology({"highway": "cycleway", "cycleway": "crossing"}, False) == "ciclovia"
        assert built_typology({"highway": "cycleway", "cycleway": "lane"}, False) == "ciclofaixa"

    def test_footway_is_calcada_compartilhada_when_bikes_allowed_or_pdc(self):
        assert built_typology({"highway": "footway", "bicycle": "designated"}, False) == "calcada_compartilhada"
        assert built_typology({"highway": "pedestrian", "bicycle": "yes"}, False) == "calcada_compartilhada"
        assert built_typology({"highway": "footway"}, False) is None
        assert built_typology({"highway": "footway"}, True) == "calcada_compartilhada"

    def test_nothing_on_an_ordinary_street(self):
        assert built_typology({"highway": "primary"}, True) is None
        assert built_typology({"highway": "trunk", "bicycle": "yes"}, False) is None


RESPONSE = {
    "osm3s": {"timestamp_osm_base": "2026-11-16T23:45:06Z"},
    "elements": [
        {"type": "relation", "id": 7, "tags": {"ref": "CM01"}, "members": [{"type": "way", "ref": 10, "role": ""}, {"type": "node", "ref": 1, "role": ""}]},
        {"type": "way", "id": 10, "tags": {"highway": "cycleway"}, "geometry": [{"lat": -8, "lon": -35}, {"lat": -8.1, "lon": -35.1}]},
    ],
}


class TestParseOverpass:
    def test_splits_relations_and_ways_in_geojson_order(self):
        data = parse_overpass(RESPONSE)
        assert data.timestamp == "2026-11-16T23:45:06Z"
        assert data.relations == [Relation(7, {"ref": "CM01"}, [10])]
        assert data.ways == [Way(10, {"highway": "cycleway"}, [[-35, -8], [-35.1, -8.1]])]

    def test_refuses_an_answer_with_a_remark(self):
        with pytest.raises(ValueError, match="timed out"):
            parse_overpass({**RESPONSE, "remark": "runtime error: Query timed out"})

    def test_round_trips_through_the_snapshot_format(self):
        data = parse_overpass(RESPONSE)
        assert OsmData.from_json(data.to_json()) == data


def test_relation_ref():
    assert relation_ref({"ref": "CM38"}) == "CM38"
    assert relation_ref({"description": "CÓD (PDC/RMR): CCV05 | Tipologia prevista: Ciclovia"}) == "CCV05"
    assert relation_ref({}) is None


def test_way_geometry_line_unless_closed_area():
    ring = [[0, 0], [1, 0], [1, 1], [0, 0]]
    assert way_geometry(Way(1, {}, ring))["type"] == "LineString"
    assert way_geometry(Way(1, {"area": "yes"}, ring))["type"] == "Polygon"


def test_way_tags():
    assert way_tags({"maxspeed": "60", "oneway": "-1", "lit": "no", "surface": "asphalt"}) == {
        "surface": "asphalt", "oneway": True, "maxspeed_kmh": 60, "lit": False,
    }
    assert way_tags({"maxspeed": "60 mph", "oneway": "reversible"})["maxspeed_kmh"] is None


def test_tiles_cover_the_whole_box():
    tiles = infrastructure_tiles(3, 2)
    assert len(tiles) == 6
    assert min(t[0] for t in tiles) == RMR_BBOX[0]
    assert min(t[1] for t in tiles) == RMR_BBOX[1]
    assert max(t[2] for t in tiles) == RMR_BBOX[2]
    assert max(t[3] for t in tiles) == RMR_BBOX[3]
    assert tiles[0][3] == tiles[1][1]
    assert tiles[0][2] == tiles[2][0]


def test_queries_are_the_same_as_the_typescript_ones():
    # Texto exato que o coletor antigo mandava (tirado do osm.ts), para o Overpass ver a mesma consulta.
    assert ways_by_id_query([1, 22, 333]) == "[out:json][timeout:60][maxsize:134217728];\nway(id:1,22,333);\nout tags geom;"
    assert infrastructure_tiles()[0] == (-8.55, -35.25, -8.25, -35.025)
    assert "[bbox:-8.55,-35.25,-7.65,-34.8];" in INFRASTRUCTURE_QUERY
    assert "[bbox:-8.55,-35.25,-7.65,-34.8];" in RACKS_QUERY


def test_infrastructure_query_exact_values_and_every_typology():
    assert "~" not in INFRASTRUCTURE_QUERY
    assert 'way["highway"="footway"]["bicycle"="designated"];' in INFRASTRUCTURE_QUERY
    assert 'way["highway"="pedestrian"]["bicycle"="yes"];' in INFRASTRUCTURE_QUERY
    # Tudo o que built_typology chama de construído tem que estar na consulta, senão nunca chega.
    for side in SIDES:
        for value in INFRA_VALUES:
            assert built_typology({side: value}, False) is not None
            assert f'way["{side}"="{value}"];' in INFRASTRUCTURE_QUERY


def test_every_query_declares_time_and_memory():
    for query in (PDC_RELATIONS_QUERY, ways_by_id_query([1]), infrastructure_query()):
        assert "[timeout:" in query and "[maxsize:" in query


def test_merge_keeps_each_way_once_and_the_oldest_timestamp():
    way = lambda i: Way(i, {}, [[0, 0], [1, 1]])  # noqa: E731
    merged = merge_osm([
        OsmData("2026-11-16T10:00:00Z", [], [way(1), way(2)]),
        OsmData("2026-11-15T10:00:00Z", [Relation(9, {}, [1])], [way(2), way(3)]),
    ])
    assert sorted(w.osm_id for w in merged.ways) == [1, 2, 3]
    assert len(merged.relations) == 1
    assert merged.timestamp == "2026-11-15T10:00:00Z"


class TestAssertFresh:
    data = OsmData("2026-07-28T02:16:18Z")

    def test_refuses_data_months_old(self):
        with pytest.raises(ValueError, match="velho demais"):
            assert_fresh(self.data, 3 * DAY, parse_time("2026-11-17T00:00:00Z"))

    def test_accepts_recent_data(self):
        assert_fresh(self.data, 3 * DAY, parse_time("2026-07-29T00:00:00Z"))

    def test_refuses_an_answer_without_a_date(self):
        with pytest.raises(ValueError):
            assert_fresh(OsmData(None), 1)


NOW = parse_time("2026-11-17T12:00:00Z")


def part(key, ways, timestamp="2026-11-17T10:00:00Z"):
    return {"key": key, "timestamp": timestamp, "endpoint": "https://overpass-api.de/api/interpreter", "relations": 0, "ways": ways}


GOOD = {
    "version": 1,
    "prefix": "staging/2026-11-17/x",
    "collectedAt": "2026-11-17T11:00:00Z",
    "pdcWayIds": 1000,
    "relations": {**part("rel", 0), "relations": 236},
    "pdcWays": [part("a", 500), part("b", 480)],
    "infrastructure": [part("t1", 100), part("t2", 0)],
}


class TestManifestProblems:
    def test_accepts_a_complete_recent_snapshot(self):
        assert manifest_problems(GOOD, NOW) == []

    def test_refuses_when_too_few_pdc_ways(self):
        assert "trechos do PDC" in ",".join(manifest_problems({**GOOD, "pdcWays": [part("a", 100)]}, NOW))

    def test_refuses_no_relations_or_no_infrastructure(self):
        assert "relação" in ",".join(manifest_problems({**GOOD, "relations": part("rel", 0)}, NOW))
        assert "infraestrutura" in ",".join(manifest_problems({**GOOD, "infrastructure": [part("t", 0)]}, NOW))

    def test_refuses_pieces_months_old(self):
        stale = {**GOOD, "infrastructure": [part("t1", 100, "2026-07-28T02:16:18Z")]}
        assert "velho demais" in ",".join(manifest_problems(stale, NOW))


PLACES = {
    "osm3s": {"timestamp_osm_base": "2026-11-18T12:00:00Z"},
    "elements": [
        {"type": "node", "id": 1, "lat": -8.05, "lon": -34.9, "tags": {"amenity": "bicycle_parking", "capacity": "12", "covered": "yes", "bicycle_parking": "stands", "operator": " Prefeitura "}},
        {"type": "way", "id": 2, "center": {"lat": -8.06, "lon": -34.91}, "tags": {"amenity": "bicycle_parking", "capacity": "10;5"}},
        {"type": "node", "id": 3, "tags": {"amenity": "bicycle_parking"}},
        {"type": "node", "id": 4, "lat": -8.1, "lon": -34.95, "tags": {"amenity": "bicycle_rental", "network": "Bike PE", "ref": "79", "capacity": "16"}},
    ],
}


class TestPlaces:
    places, timestamp = parse_places(PLACES)

    def test_nodes_and_way_centers_dropping_what_has_no_position(self):
        assert [p.osm_id for p in self.places] == ["node/1", "way/2", "node/4"]
        assert (self.places[1].lat, self.places[1].lon) == (-8.06, -34.91)
        assert self.timestamp == "2026-11-18T12:00:00Z"

    def test_refuses_an_answer_without_elements(self):
        with pytest.raises(ValueError, match="elements"):
            parse_places({"nada": True})

    def test_rack_capacity_only_when_a_number(self):
        a, b = (to_rack(p) for p in self.places[:2])
        assert (a.capacity, a.covered, a.parking_type, a.operator) == (12, "yes", "stands", "Prefeitura")
        assert b.capacity is None and b.tags["capacity"] == "10;5"

    def test_station(self):
        s = to_station(self.places[2])
        assert (s.ref, s.capacity, s.network, s.name) == ("79", 16, "Bike PE", None)


def feature(properties, geometry=None):
    return {"properties": properties, "geometry": geometry or {"type": "MultiLineString", "coordinates": [[[-34.9, -8.05], [-34.91, -8.06]]]}}


BASE = {"OBJECTID": 7, "CLOGRACODI": 1945, "NLOGRACONC": "AV GOVERNADOR AGAMENON MAGALHAES",
        "NLGPAVOFIC": "Avenida Governador Agamenon Magalhães", "INDPAV": "Via Pavimentada", "DB2GSE.Sde": 144.6}


class TestSegment:
    def test_converts_a_segment(self):
        s = to_segment(feature(BASE))
        assert (s.source_id, s.street_code, s.name_key, s.official_name, s.length_m) == (
            7, 1945, "AV GOVERNADOR AGAMENON MAGALHAES", "Avenida Governador Agamenon Magalhães", 144.6)

    def test_name_key_like_samu(self):
        assert name_key("  Rua  João   da Silva ") == "RUA JOAO DA SILVA"

    def test_skips_with_a_reason(self):
        assert to_segment(feature({**BASE, "NLOGRACONC": " "})) == "sem OBJECTID, código ou nome do logradouro"
        assert to_segment(feature({**BASE, "DB2GSE.Sde": None})) == "sem comprimento"
        assert to_segment(feature(BASE, {"type": "Point", "coordinates": [0, 0]})) == "geometria que não é MultiLineString"
        assert to_segment(feature(BASE, {"type": "MultiLineString", "coordinates": []})) == "geometria que não é MultiLineString"
