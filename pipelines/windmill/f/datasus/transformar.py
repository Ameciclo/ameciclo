#requirements:
#dbt-postgres>=1.9

# Passo 3 do DATASUS: dbt build do staging e do mart. Os testes do staging rodam antes do mart; se algum falhar, o
# mart não é refeito e o site continua com a versão anterior.
#
# Os modelos SQL ficam no repositório (pipelines/transform, montado no worker), não no Windmill: aqui só se chama o dbt.

import os
from typing import TypedDict

from dbt.cli.main import dbtRunner


class postgresql(TypedDict):
    host: str
    port: int
    user: str
    password: str
    dbname: str
    sslmode: str


def main(banco: postgresql, selecao: str = "source:datasus+", projeto: str = "/opt/pipelines/transform"):
    # O profiles.yml do projeto lê a conexão destas variáveis.
    os.environ.update(
        PGHOST=banco["host"],
        PGPORT=str(banco.get("port", 5432)),
        PGUSER=banco["user"],
        PGPASSWORD=banco["password"],
        PGDATABASE=banco["dbname"],
        DBT_SEND_ANONYMOUS_USAGE_STATS="false",
    )
    resultado = dbtRunner().invoke(
        ["build", "--project-dir", projeto, "--profiles-dir", projeto, "--target-path", "/tmp/dbt-target",
         "--log-path", "/tmp/dbt-logs", "--select", selecao]
    )
    nos = [
        {"no": r.node.name, "tipo": r.node.resource_type, "status": str(r.status), "mensagem": r.message}
        for r in (resultado.result or [])
    ]
    if not resultado.success:
        falhas = [n for n in nos if n["status"] in ("fail", "error")]
        raise RuntimeError(f"dbt build falhou: {falhas or resultado.exception}")
    return {"nos": nos}
