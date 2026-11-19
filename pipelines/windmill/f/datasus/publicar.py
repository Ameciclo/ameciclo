#requirements:
#psycopg[binary]>=3.2

# Passo 4 do DATASUS: depois de um dbt build sem erro, marca as cargas como publicadas em meta.carga.

from typing import TypedDict

from f.pipelines.cargas import conectar, publicar


class postgresql(TypedDict):
    host: str
    port: int
    user: str
    password: str
    dbname: str
    sslmode: str


def main(banco: postgresql):
    with conectar(banco) as conn:
        return {"cargas_publicadas": publicar(conn, "datasus.sim")}
