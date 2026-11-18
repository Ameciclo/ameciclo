"""Baixa do FTP do DATASUS os óbitos do SIM de um ano (todo o Brasil) e grava só as linhas de trânsito.

    python baixar-mortes.py 2024 pasta/            -> pasta/mortes_transito_2024.csv

Usa a versão final (SIM/CID10/DORES) e, se o ano ainda não saiu, a preliminar (SIM/PRELIM/DORES).
Guarda as causas básicas V (acidentes de transporte e afins) e Y85 (sequelas de acidente de transporte),
com as 87 colunas do SIM; quem filtra o que entra no banco é o importador (import-mortes.ts).
Precisa de: pip install datasus-dbc dbfread
"""
import csv
import os
import sys
import tempfile
import urllib.error
import urllib.request

import datasus_dbc
from dbfread import DBF

BASE = "ftp://ftp.datasus.gov.br/dissemin/publicos/SIM"
KEEP = ("V", "Y85")


def download(year: int, dest: str) -> str:
    for folder, label in (("CID10/DORES", "final"), ("PRELIM/DORES", "preliminar")):
        try:
            urllib.request.urlretrieve(f"{BASE}/{folder}/DOBR{year}.dbc", dest)
            return label
        except urllib.error.URLError:
            continue
    raise SystemExit(f"{year}: arquivo não encontrado no DATASUS")


def main(year: int, out_dir: str) -> None:
    os.makedirs(out_dir, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        dbc, dbf = os.path.join(tmp, "x.dbc"), os.path.join(tmp, "x.dbf")
        status = download(year, dbc)
        datasus_dbc.decompress(dbc, dbf)
        table = DBF(dbf, encoding="latin-1", char_decode_errors="replace")
        total = kept = 0
        with open(os.path.join(out_dir, f"mortes_transito_{year}.csv"), "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f, quoting=csv.QUOTE_ALL)
            writer.writerow(table.field_names)
            for row in table:
                total += 1
                cause = (row.get("CAUSABAS") or "").lstrip("*")
                if cause.startswith(KEEP):
                    kept += 1
                    writer.writerow(["" if row[k] is None else str(row[k]) for k in table.field_names])
    print(f"{year} ({status}): {total} óbitos no Brasil, {kept} de trânsito e sequelas", flush=True)


if __name__ == "__main__":
    main(int(sys.argv[1]), sys.argv[2])
