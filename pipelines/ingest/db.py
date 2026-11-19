"""Conexão com o banco e o registro das cargas (meta.carga)."""

import os

import psycopg


def connect() -> psycopg.Connection:
    """PIPELINE_DATABASE_URL, se houver; senão as variáveis padrão do Postgres (PGHOST, PGUSER, PGPASSWORD...), as
    mesmas que o dbt usa. Assim a senha fica numa variável só."""
    url = os.environ.get("PIPELINE_DATABASE_URL")
    if not url and not os.environ.get("PGHOST"):
        raise SystemExit("defina PIPELINE_DATABASE_URL ou PGHOST/PGUSER/PGPASSWORD/PGDATABASE")
    return psycopg.connect(url or "")


def start_load(conn: psycopg.Connection, fonte: str, particao: str, arquivo: str, sha256: str) -> int:
    with conn.cursor() as cur:
        cur.execute(
            "insert into meta.carga (fonte, particao, arquivo, sha256) values (%s, %s, %s, %s) returning id",
            (fonte, particao, arquivo, sha256),
        )
        (load_id,) = cur.fetchone()
    conn.commit()
    return load_id


def already_loaded(conn: psycopg.Connection, fonte: str, particao: str, sha256: str) -> bool:
    """Se este mesmo arquivo já entrou no banco (carregado ou publicado), não há o que fazer."""
    with conn.cursor() as cur:
        cur.execute(
            """select sha256 from meta.carga where fonte = %s and particao = %s and status in ('carregada', 'publicada')
               order by iniciada_em desc limit 1""",
            (fonte, particao),
        )
        row = cur.fetchone()
        return row is not None and row[0] == sha256


def finish_load(conn: psycopg.Connection, load_id: int, status: str, linhas: int | None = None) -> None:
    with conn.cursor() as cur:
        cur.execute(
            "update meta.carga set status = %s, linhas = coalesce(%s, linhas), carregada_em = case when %s = 'carregada' then now() else carregada_em end where id = %s",
            (status, linhas, status, load_id),
        )
    conn.commit()


def publish(conn: psycopg.Connection, fonte: str, commit: bool = True) -> int:
    """As cargas desta fonte que estavam esperando passam a valer no site (ver ingest.publicar)."""
    with conn.cursor() as cur:
        cur.execute(
            "update meta.carga set status = 'publicada', publicada_em = now() where fonte = %s and status = 'carregada'",
            (fonte,),
        )
        count = cur.rowcount
    if commit:
        conn.commit()
    return count
