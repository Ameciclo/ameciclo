# Conexão com o banco (a partir do resource postgresql do Windmill) e o registro das cargas em meta.carga.
#
# Script de apoio: os passos importam daqui com `from f.pipelines.cargas import ...`.

import psycopg


def conectar(banco: dict) -> psycopg.Connection:
    return psycopg.connect(
        host=banco["host"],
        port=banco.get("port", 5432),
        user=banco["user"],
        password=banco["password"],
        dbname=banco["dbname"],
        sslmode=banco.get("sslmode", "prefer"),
    )


def iniciar(conn: psycopg.Connection, fonte: str, particao: str, arquivo: str, sha256: str) -> int:
    with conn.cursor() as cur:
        cur.execute(
            "insert into meta.carga (fonte, particao, arquivo, sha256) values (%s, %s, %s, %s) returning id",
            (fonte, particao, arquivo, sha256),
        )
        (carga,) = cur.fetchone()
    conn.commit()
    return carga


def ja_carregado(conn: psycopg.Connection, fonte: str, particao: str, sha256: str) -> bool:
    """Se este mesmo arquivo já entrou no banco (carregado ou publicado), não há o que fazer."""
    with conn.cursor() as cur:
        cur.execute(
            """select sha256 from meta.carga where fonte = %s and particao = %s and status in ('carregada', 'publicada')
               order by iniciada_em desc limit 1""",
            (fonte, particao),
        )
        linha = cur.fetchone()
        return linha is not None and linha[0] == sha256


def terminar(conn: psycopg.Connection, carga: int, status: str, linhas: int | None = None) -> None:
    with conn.cursor() as cur:
        cur.execute(
            """update meta.carga set status = %s, linhas = coalesce(%s, linhas),
                 carregada_em = case when %s = 'carregada' then now() else carregada_em end
               where id = %s""",
            (status, linhas, status, carga),
        )
    conn.commit()


def publicar(conn: psycopg.Connection, fonte: str) -> int:
    """Depois do dbt build: as cargas desta fonte que estavam esperando passam a valer no site."""
    with conn.cursor() as cur:
        cur.execute(
            "update meta.carga set status = 'publicada', publicada_em = now() where fonte = %s and status = 'carregada'",
            (fonte,),
        )
        total = cur.rowcount
    conn.commit()
    return total
