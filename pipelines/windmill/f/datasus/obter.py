#requirements:
#datasus-dbc>=0.1
#dbfread>=2.0

# Passo 1 do DATASUS: guarda no lago o arquivo do SIM de um ano.
#
# Com `pasta`, usa o mortes_transito_AAAA.csv que já está lá; sem, baixa do FTP do DATASUS (e não baixa de novo
# por 24 h, a não ser com `forcar`). O arquivo do SIM tem o Brasil inteiro e todas as causas: aqui só ficam as
# causas V e Y85 (transporte), o único corte feito antes do banco, e só por tamanho. Quem decide o que entra no
# site (RMR, V01-V89 e V99) é o staging do dbt.

import csv
import tempfile
import urllib.error
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path

from f.pipelines.lago import guardar, ultima

FONTE = "datasus.sim"
FTP = "ftp://ftp.datasus.gov.br/dissemin/publicos/SIM"


def _do_ftp(ano: int, saida: Path) -> str:
    import datasus_dbc
    from dbfread import DBF

    with tempfile.TemporaryDirectory() as tmp:
        dbc, dbf = Path(tmp) / "x.dbc", Path(tmp) / "x.dbf"
        for pasta in ("CID10/DORES", "PRELIM/DORES"):
            url = f"{FTP}/{pasta}/DOBR{ano}.dbc"
            try:
                urllib.request.urlretrieve(url, dbc)
                break
            except urllib.error.URLError:
                continue
        else:
            raise RuntimeError(f"{ano}: arquivo não encontrado no DATASUS")
        datasus_dbc.decompress(str(dbc), str(dbf))
        tabela = DBF(str(dbf), encoding="latin-1", char_decode_errors="replace")
        with saida.open("w", newline="", encoding="utf-8") as f:
            escritor = csv.DictWriter(f, fieldnames=tabela.field_names, quoting=csv.QUOTE_ALL)
            escritor.writeheader()
            for registro in tabela:
                if str(registro.get("CAUSABAS") or "").lstrip("*").startswith(("V", "Y85")):
                    escritor.writerow(registro)
    return url


def main(ano: int, pasta: str = "/data/mortes", forcar: bool = False, lago: str = "/var/lib/pipelines/lake"):
    raiz = Path(lago)
    anterior = ultima(raiz, FONTE, str(ano))
    if not pasta and anterior and not forcar:
        idade = datetime.now(timezone.utc) - datetime.fromisoformat(anterior.obtido_em)
        if idade < timedelta(hours=24):
            return {"situacao": f"obtido há {idade.seconds // 3600} h; nada a baixar", "arquivo": anterior.arquivo}
    with tempfile.TemporaryDirectory() as tmp:
        if pasta:
            origem_arquivo = Path(pasta) / f"mortes_transito_{ano}.csv"
            if not origem_arquivo.exists():
                raise FileNotFoundError(f"{origem_arquivo} não existe")
            origem = f"pasta local: {origem_arquivo}"
        else:
            origem_arquivo = Path(tmp) / f"mortes_transito_{ano}.csv"
            origem = _do_ftp(ano, origem_arquivo)
        entrada, novo = guardar(raiz, FONTE, str(ano), origem_arquivo, origem)
    return {"arquivo": entrada.arquivo, "sha256": entrada.sha256, "origem": entrada.origem, "novo": novo}
