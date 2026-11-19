"""Óbitos do SIM/DATASUS: os passos de ingestão (obter e carregar). Nenhuma regra de negócio aqui: elas ficam no dbt.

    python -m ingest.datasus obter --ano 2023 --de-pasta ../data/mortes   usa um CSV já baixado
    python -m ingest.datasus obter --ano 2023                             baixa do FTP (pula se já baixou nas últimas 24 h)
    python -m ingest.datasus carregar --ano 2023                          lago -> raw.datasus_sim (pula se já carregado)

O arquivo do SIM tem o Brasil inteiro e todas as causas (milhões de linhas). O obter guarda só as causas V e Y85
(transporte), como o script antigo; é o único corte feito antes do banco, e só por tamanho. Quem decide o que entra
no site (RMR, V01-V89 e V99) é o staging do dbt.
"""

import argparse
import csv
import sys
import tempfile
import urllib.error
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path

from . import db, lake

FONTE = "datasus.sim"
TABLE = "raw.datasus_sim"
FTP = "ftp://ftp.datasus.gov.br/dissemin/publicos/SIM"
KEEP = ("V", "Y85")
FRESH_FOR = timedelta(hours=24)
META_COLUMNS = ("_carga", "_ano_arquivo", "_linha")


def _from_ftp(year: int, out: Path) -> str:
    import datasus_dbc  # só o modo FTP precisa
    from dbfread import DBF

    with tempfile.TemporaryDirectory() as tmp:
        dbc, dbf = Path(tmp) / "x.dbc", Path(tmp) / "x.dbf"
        for folder in ("CID10/DORES", "PRELIM/DORES"):
            url = f"{FTP}/{folder}/DOBR{year}.dbc"
            try:
                urllib.request.urlretrieve(url, dbc)
                break
            except urllib.error.URLError:
                continue
        else:
            raise SystemExit(f"{year}: arquivo não encontrado no DATASUS")
        datasus_dbc.decompress(str(dbc), str(dbf))
        table = DBF(str(dbf), encoding="latin-1", char_decode_errors="replace")
        with out.open("w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=table.field_names, quoting=csv.QUOTE_ALL)
            writer.writeheader()
            for record in table:
                if str(record.get("CAUSABAS") or "").lstrip("*").startswith(KEEP):
                    writer.writerow(record)
    return url


def obter(year: int, de_pasta: Path | None, forcar: bool) -> None:
    previous = lake.latest(FONTE, str(year))
    if de_pasta is None and previous and not forcar:
        age = datetime.now(timezone.utc) - datetime.fromisoformat(previous.obtido_em)
        if age < FRESH_FOR:
            print(f"{year}: obtido há {age.seconds // 3600} h; nada a baixar (use --forcar para baixar de novo)")
            return
    with tempfile.TemporaryDirectory() as tmp:
        if de_pasta is not None:
            source = de_pasta / f"mortes_transito_{year}.csv"
            if not source.exists():
                raise SystemExit(f"{source} não existe")
            origem = f"pasta local: {source}"
        else:
            source = Path(tmp) / f"mortes_transito_{year}.csv"
            origem = _from_ftp(year, source)
        entry, changed = lake.put(FONTE, str(year), source, origem)
    print(f"{year}: {'arquivo novo' if changed else 'igual ao anterior'} -> {entry.arquivo}")


def _ensure_table(cur, header: list[str]) -> None:
    """Cria raw.datasus_sim (tudo texto) e acrescenta colunas que a fonte passar a ter. Nunca apaga colunas."""
    cur.execute(f"create table if not exists {TABLE} (_carga bigint not null, _ano_arquivo smallint not null, _linha integer not null)")
    cur.execute(
        "select column_name from information_schema.columns where table_schema = 'raw' and table_name = 'datasus_sim'"
    )
    existing = {name for (name,) in cur.fetchall()}
    for column in header:
        if column not in existing:
            cur.execute(f'alter table {TABLE} add column "{column}" text')


def carregar(year: int, forcar: bool) -> None:
    entry = lake.latest(FONTE, str(year))
    if entry is None:
        raise SystemExit(f"{year}: nada no lago; rode o obter antes")
    with db.connect() as conn:
        if not forcar and db.already_loaded(conn, FONTE, str(year), entry.sha256):
            print(f"{year}: este arquivo já está no banco; nada a carregar")
            return
        load_id = db.start_load(conn, FONTE, str(year), entry.arquivo, entry.sha256)
        try:
            with lake.path_of(entry).open(newline="", encoding="utf-8") as f:
                reader = csv.reader(f)
                header = next(reader)
                with conn.cursor() as cur:
                    _ensure_table(cur, header)
                    # O raw guarda só a última carga de cada ano; as anteriores continuam no lago.
                    cur.execute(f"delete from {TABLE} where _ano_arquivo = %s", (year,))
                    columns = ", ".join([*META_COLUMNS, *(f'"{c}"' for c in header)])
                    rows = 0
                    with cur.copy(f"copy {TABLE} ({columns}) from stdin") as copy:
                        for line_number, values in enumerate(reader, start=1):
                            # Valor exatamente como veio (inclusive "" e "NA"): limpar é trabalho do staging.
                            copy.write_row([load_id, year, line_number, *values])
                            rows += 1
            conn.commit()
        except Exception:
            conn.rollback()
            db.finish_load(conn, load_id, "falhou")
            raise
        db.finish_load(conn, load_id, "carregada", rows)
    print(f"{year}: {rows} linhas em {TABLE} (carga {load_id})")


def main() -> None:
    parser = argparse.ArgumentParser(prog="python -m ingest.datasus")
    sub = parser.add_subparsers(dest="passo", required=True)
    p_obter = sub.add_parser("obter")
    p_obter.add_argument("--ano", type=int, required=True)
    p_obter.add_argument("--de-pasta", type=Path)
    p_obter.add_argument("--forcar", action="store_true")
    p_carregar = sub.add_parser("carregar")
    p_carregar.add_argument("--ano", type=int, required=True)
    p_carregar.add_argument("--forcar", action="store_true")
    args = parser.parse_args()
    if args.passo == "obter":
        obter(args.ano, args.de_pasta, args.forcar)
    else:
        carregar(args.ano, args.forcar)


if __name__ == "__main__":
    sys.exit(main())
