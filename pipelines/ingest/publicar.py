"""Último passo: depois de um dbt build sem erro, marca as cargas da fonte como publicadas.

    python -m ingest.publicar datasus.sim
"""

import sys

from . import db

if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("uso: python -m ingest.publicar <fonte>")
    with db.connect() as conn:
        print(f"{sys.argv[1]}: {db.publish(conn, sys.argv[1])} carga(s) publicada(s)")
