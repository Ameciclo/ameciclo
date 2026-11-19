"""Sincroniza o repositório com o Kestra local (http://localhost:8098), nos dois sentidos.

    python3 pipelines/kestra/sincronizar.py enviar   repositório -> Kestra: os fluxos (kestra/flows/*.yaml) e o código
                                                     (ingest/ e transform/) como arquivos do namespace
    python3 pipelines/kestra/sincronizar.py puxar    Kestra -> repositório: traz o que foi editado na interface

O código continua tendo uma fonte só, o repositório: o Dagu lê as mesmas pastas. No servidor, o caminho seria o
plugin de git do Kestra (io.kestra.plugin.git.SyncNamespaceFiles e SyncFlows) apontando para o GitHub.
"""

import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
import uuid
from base64 import b64encode
from pathlib import Path

# Por padrão o Kestra local. Para o do Coolify:
#   KESTRA_URL=https://kestra.ameciclo.org KESTRA_ADMIN_USER=... KESTRA_ADMIN_PASSWORD=... python3 sincronizar.py enviar
API = os.environ.get("KESTRA_URL", "http://localhost:8098").rstrip("/") + "/api/v1/main"
NAMESPACE = "ameciclo.pipelines"
AUTH = "Basic " + b64encode(
    f"{os.environ.get('KESTRA_ADMIN_USER', 'admin@kestra.io')}:{os.environ.get('KESTRA_ADMIN_PASSWORD', 'Admin1234!')}".encode()
).decode()
RAIZ = Path(__file__).resolve().parent.parent  # pipelines/
PASTAS = ["ingest", "transform"]
IGNORAR = {"target", "logs", "dbt_packages", "__pycache__", ".user.yml"}


def chamar(metodo: str, caminho: str, corpo: bytes | None = None, tipo: str | None = None):
    pedido = urllib.request.Request(f"{API}{caminho}", data=corpo, method=metodo)
    pedido.add_header("Authorization", AUTH)
    # O Cloudflare na frente do Kestra do Coolify recusa o User-Agent padrão do Python (erro 1010).
    pedido.add_header("User-Agent", "ameciclo-sincronizar/1.0")
    if tipo:
        pedido.add_header("content-type", tipo)
    try:
        with urllib.request.urlopen(pedido) as resposta:
            return resposta.read()
    except urllib.error.HTTPError as erro:
        if erro.code == 404:
            return None
        raise RuntimeError(f"{metodo} {caminho}: {erro.code} {erro.read().decode()[:500]}") from erro


def arquivos_locais() -> dict[str, Path]:
    saida = {}
    for pasta in PASTAS:
        for arquivo in sorted((RAIZ / pasta).rglob("*")):
            relativo = arquivo.relative_to(RAIZ)
            if arquivo.is_file() and not IGNORAR.intersection(relativo.parts):
                saida["/" + relativo.as_posix()] = arquivo
    return saida


def arquivos_remotos(diretorio: str = "/") -> list[str]:
    saida = []
    resposta = chamar("GET", f"/namespaces/{NAMESPACE}/files/directory?path={urllib.parse.quote(diretorio)}")
    for item in json.loads(resposta or b"[]"):
        caminho = diretorio.rstrip("/") + "/" + item["fileName"]
        if item["type"] == "Directory":
            saida += arquivos_remotos(caminho)
        else:
            saida.append(caminho)
    return saida


def enviar_arquivo(caminho: str, conteudo: bytes) -> None:
    fronteira = uuid.uuid4().hex
    corpo = (
        f"--{fronteira}\r\nContent-Disposition: form-data; name=\"fileContent\"; filename=\"{Path(caminho).name}\"\r\n"
        f"Content-Type: application/octet-stream\r\n\r\n"
    ).encode() + conteudo + f"\r\n--{fronteira}--\r\n".encode()
    chamar("POST", f"/namespaces/{NAMESPACE}/files?path={urllib.parse.quote(caminho)}", corpo, f"multipart/form-data; boundary={fronteira}")


def enviar() -> None:
    locais = arquivos_locais()
    remotos = set(arquivos_remotos())
    for caminho, arquivo in locais.items():
        conteudo = arquivo.read_bytes()
        if caminho in remotos and chamar("GET", f"/namespaces/{NAMESPACE}/files?path={urllib.parse.quote(caminho)}") == conteudo:
            continue
        enviar_arquivo(caminho, conteudo)
        print(f"arquivo {caminho} {'atualizado' if caminho in remotos else 'criado'}")
    for caminho in sorted(remotos - set(locais)):
        chamar("DELETE", f"/namespaces/{NAMESPACE}/files?path={urllib.parse.quote(caminho)}")
        print(f"arquivo {caminho} apagado (não existe mais no repositório)")

    for arquivo in sorted((RAIZ / "kestra" / "flows").glob("*.yaml")):
        fonte = arquivo.read_bytes()
        fluxo_id = next(l.split(":", 1)[1].strip() for l in fonte.decode().splitlines() if l.startswith("id:"))
        atual = chamar("GET", f"/flows/{NAMESPACE}/{fluxo_id}?source=true")
        if atual is None:
            chamar("POST", "/flows", fonte, "application/x-yaml")
            print(f"fluxo {fluxo_id} criado")
        elif json.loads(atual).get("source", "").strip() != fonte.decode().strip():
            chamar("PUT", f"/flows/{NAMESPACE}/{fluxo_id}", fonte, "application/x-yaml")
            print(f"fluxo {fluxo_id} atualizado")


def puxar() -> None:
    for caminho in arquivos_remotos():
        conteudo = chamar("GET", f"/namespaces/{NAMESPACE}/files?path={urllib.parse.quote(caminho)}")
        destino = RAIZ / caminho.lstrip("/")
        if not destino.exists() or destino.read_bytes() != conteudo:
            destino.parent.mkdir(parents=True, exist_ok=True)
            destino.write_bytes(conteudo)
            print(f"arquivo {caminho} trazido")
    for arquivo in sorted((RAIZ / "kestra" / "flows").glob("*.yaml")):
        fluxo_id = next(l.split(":", 1)[1].strip() for l in arquivo.read_text().splitlines() if l.startswith("id:"))
        atual = chamar("GET", f"/flows/{NAMESPACE}/{fluxo_id}?source=true")
        if atual is not None:
            fonte = json.loads(atual)["source"].rstrip() + "\n"
            if arquivo.read_text() != fonte:
                arquivo.write_text(fonte)
                print(f"fluxo {fluxo_id} trazido")


if __name__ == "__main__":
    {"enviar": enviar, "puxar": puxar}[sys.argv[1] if len(sys.argv) > 1 else "enviar"]()
