#requirements:
#psycopg[binary]>=3.2

# Passo 2 do DATASUS: lago -> raw.datasus_sim, numa transação, com cada valor exatamente como veio (tudo texto).
# Se este mesmo arquivo já está no banco, não faz nada. O raw guarda só a última carga de cada ano; as anteriores
# continuam no lago.

import csv
from pathlib import Path
from typing import TypedDict

from f.pipelines.cargas import conectar, iniciar, ja_carregado, terminar
from f.pipelines.lago import caminho, ultima

FONTE = "datasus.sim"
TABELA = "raw.datasus_sim"


class postgresql(TypedDict):
    host: str
    port: int
    user: str
    password: str
    dbname: str
    sslmode: str


def _garantir_tabela(cur, cabecalho: list[str]) -> None:
    """Cria a tabela e acrescenta as colunas novas que a fonte passar a ter. Nunca apaga colunas."""
    cur.execute(f"create table if not exists {TABELA} (_carga bigint not null, _ano_arquivo smallint not null, _linha integer not null)")
    cur.execute("select column_name from information_schema.columns where table_schema = 'raw' and table_name = 'datasus_sim'")
    existentes = {nome for (nome,) in cur.fetchall()}
    for coluna in cabecalho:
        if coluna not in existentes:
            cur.execute(f'alter table {TABELA} add column "{coluna}" text')


def main(banco: postgresql, ano: int, forcar: bool = False, lago: str = "/var/lib/pipelines/lake"):
    raiz = Path(lago)
    entrada = ultima(raiz, FONTE, str(ano))
    if entrada is None:
        raise RuntimeError(f"{ano}: nada no lago; rode o passo obter antes")
    with conectar(banco) as conn:
        if not forcar and ja_carregado(conn, FONTE, str(ano), entrada.sha256):
            return {"situacao": "este arquivo já está no banco; nada a carregar", "arquivo": entrada.arquivo}
        carga = iniciar(conn, FONTE, str(ano), entrada.arquivo, entrada.sha256)
        try:
            with caminho(raiz, entrada).open(newline="", encoding="utf-8") as f:
                leitor = csv.reader(f)
                cabecalho = next(leitor)
                with conn.cursor() as cur:
                    _garantir_tabela(cur, cabecalho)
                    cur.execute(f"delete from {TABELA} where _ano_arquivo = %s", (ano,))
                    colunas = ", ".join(["_carga", "_ano_arquivo", "_linha", *(f'"{c}"' for c in cabecalho)])
                    linhas = 0
                    with cur.copy(f"copy {TABELA} ({colunas}) from stdin") as copia:
                        for numero, valores in enumerate(leitor, start=1):
                            copia.write_row([carga, ano, numero, *valores])
                            linhas += 1
            conn.commit()
        except Exception:
            conn.rollback()
            terminar(conn, carga, "falhou")
            raise
        terminar(conn, carga, "carregada", linhas)
    return {"carga": carga, "linhas": linhas, "arquivo": entrada.arquivo}
