"""Último passo: copia o que o dbt preparou (schema publicacao) para a tabela final, que é do Drizzle.

    python -m ingest.publicar datasus.sim            só os anos com carga nova (status 'carregada' em meta.carga)
    python -m ingest.publicar datasus.sim --tudo     todos os anos (ex. depois de mudar a regra no dbt)

Roda só depois de um dbt build sem erro. Numa transação: apaga os anos da tabela final, insere de novo a partir da view
e marca as cargas como publicadas. Se o insert falhar (coluna ou tipo diferente do Drizzle), nada muda no site.
As colunas copiadas são as da view; as que o banco preenche sozinho (id, created_at) ficam de fora.
"""

import argparse

from psycopg import sql

from . import db

# fonte -> de onde vem (view do dbt), para onde vai (tabela do Drizzle) e a coluna que separa as partições (o ano).
PUBLICACOES = {
    "datasus.sim": {"origem": ("publicacao", "traffic_death"), "destino": ("public", "traffic_death"), "particao": "source_year"},
}


def publicar(fonte: str, tudo: bool = False) -> dict:
    cfg = PUBLICACOES[fonte]
    origem, destino, part = sql.Identifier(*cfg["origem"]), sql.Identifier(*cfg["destino"]), sql.Identifier(cfg["particao"])
    with db.connect() as conn, conn.transaction(), conn.cursor() as cur:
        cur.execute(
            "select column_name from information_schema.columns where table_schema = %s and table_name = %s order by ordinal_position",
            cfg["origem"],
        )
        colunas = sql.SQL(", ").join(sql.Identifier(c) for (c,) in cur.fetchall())
        if tudo:
            cur.execute(sql.SQL("select distinct {}::int from {}").format(part, origem))
        else:
            cur.execute("select distinct particao::int from meta.carga where fonte = %s and status = 'carregada'", (fonte,))
        anos = sorted(a for (a,) in cur.fetchall())
        if not anos:
            return {"anos": [], "apagadas": 0, "inseridas": 0, "cargas_publicadas": 0}

        cur.execute(sql.SQL("delete from {} where {} = any(%s)").format(destino, part), (anos,))
        apagadas = cur.rowcount
        cur.execute(
            sql.SQL("insert into {} ({}) select {} from {} where {} = any(%s)").format(destino, colunas, colunas, origem, part),
            (anos,),
        )
        inseridas = cur.rowcount
        cargas = db.publish(conn, fonte, commit=False)
    return {"anos": anos, "apagadas": apagadas, "inseridas": inseridas, "cargas_publicadas": cargas}


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("fonte", choices=sorted(PUBLICACOES))
    ap.add_argument("--tudo", action="store_true")
    args = ap.parse_args()
    r = publicar(args.fonte, args.tudo)
    print(f"{args.fonte}: anos {r['anos'] or 'nenhum'}; {r['apagadas']} linha(s) apagada(s), {r['inseridas']} inserida(s); "
          f"{r['cargas_publicadas']} carga(s) publicada(s)")
