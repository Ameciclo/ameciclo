"""Sincroniza esta pasta com o Windmill local. Substituto provisório da CLI oficial (wmill sync push/pull).

    python3 sincronizar.py enviar   pasta -> Windmill (área de trabalho, resource do banco, scripts e fluxos)
    python3 sincronizar.py enviar --tudo   envia de novo mesmo o que não mudou (refaz as dependências)
    python3 sincronizar.py puxar    Windmill -> pasta (traz para o git o que foi editado na interface)

Cada f/<pasta>/<nome>.py vira o script f/<pasta>/<nome>; cada f/<pasta>/<nome>.flow.json vira o fluxo f/<pasta>/<nome>.
O formulário de cada script sai da assinatura do main().
"""

import ast
import json
import sys
import urllib.error
import urllib.request
from pathlib import Path

API = "http://localhost:8097/api"
WS = "ameciclo"
TOKEN = "local-superadmin"
AQUI = Path(__file__).resolve().parent
TIPOS = {"int": {"type": "integer"}, "str": {"type": "string"}, "bool": {"type": "boolean"}, "float": {"type": "number"}}
BANCO_LOCAL = {"host": "db", "port": 5432, "user": "ameciclo", "password": "ameciclo", "dbname": "ameciclo", "sslmode": "disable"}


def chamar(metodo: str, caminho: str, corpo=None):
    dados = json.dumps(corpo).encode() if corpo is not None else None
    pedido = urllib.request.Request(f"{API}{caminho}", data=dados, method=metodo)
    pedido.add_header("Authorization", f"Bearer {TOKEN}")
    pedido.add_header("content-type", "application/json")
    try:
        with urllib.request.urlopen(pedido) as resposta:
            texto = resposta.read().decode()
            return json.loads(texto) if texto.strip().startswith(("{", "[")) else texto
    except urllib.error.HTTPError as erro:
        if erro.code == 404:
            return None
        raise RuntimeError(f"{metodo} {caminho}: {erro.code} {erro.read().decode()}") from erro


def esquema(codigo: str) -> dict:
    """JSON Schema a partir de def main(...): int/str/bool/float e o TypedDict postgresql (resource do Windmill)."""
    main = next((n for n in ast.parse(codigo).body if isinstance(n, ast.FunctionDef) and n.name == "main"), None)
    props, obrigatorios, ordem = {}, [], []
    if main is not None:
        args = main.args.args
        padroes = [None] * (len(args) - len(main.args.defaults)) + list(main.args.defaults)
        for arg, padrao in zip(args, padroes):
            tipo = ast.unparse(arg.annotation) if arg.annotation else "str"
            prop = {"type": "object", "format": "resource-postgresql"} if tipo == "postgresql" else dict(TIPOS.get(tipo, {"type": "string"}))
            if padrao is not None:
                prop["default"] = ast.literal_eval(padrao)
            else:
                obrigatorios.append(arg.arg)
            props[arg.arg] = prop
            ordem.append(arg.arg)
    return {"$schema": "https://json-schema.org/draft/2020-12/schema", "type": "object", "properties": props, "required": obrigatorios, "order": ordem}


def resumo(codigo: str) -> str:
    """A primeira linha de comentário que não é do cabeçalho #requirements."""
    for linha in codigo.splitlines():
        if linha.startswith("# ") and linha[2:].strip():
            return linha[2:].strip()[:200]
    return ""


def enviar() -> None:
    if chamar("GET", f"/w/{WS}/workspaces/get_settings") is None:
        chamar("POST", "/workspaces/create", {"id": WS, "name": "Ameciclo"})
        print(f"área de trabalho {WS} criada")
    pastas = {p.parent.name for p in (AQUI / "f").glob("*/*")}
    for pasta in sorted(pastas):
        if chamar("GET", f"/w/{WS}/folders/get/{pasta}") is None:
            chamar("POST", f"/w/{WS}/folders/create", {"name": pasta})
    recurso = "f/pipelines/banco_local"
    if chamar("GET", f"/w/{WS}/resources/get/{recurso}") is None:
        chamar("POST", f"/w/{WS}/resources/create", {"path": recurso, "resource_type": "postgresql", "value": BANCO_LOCAL, "description": "Postgres do docker-compose do protótipo"})
        print(f"resource {recurso} criado")

    # Primeiro os scripts de apoio (sem main), porque os passos importam deles.
    arquivos = sorted((AQUI / "f").glob("*/*.py"), key=lambda p: "def main(" in p.read_text())
    for arquivo in arquivos:
        caminho = str(arquivo.relative_to(AQUI).with_suffix(""))
        codigo = arquivo.read_text()
        atual = chamar("GET", f"/w/{WS}/scripts/get/p/{caminho}")
        if atual and atual.get("content") == codigo and "--tudo" not in sys.argv:
            continue
        corpo = {"path": caminho, "summary": resumo(codigo), "description": "", "content": codigo, "language": "python3", "schema": esquema(codigo), "kind": "script"}
        if atual:
            corpo["parent_hash"] = atual["hash"]
        chamar("POST", f"/w/{WS}/scripts/create", corpo)
        print(f"script {caminho} {'atualizado' if atual else 'criado'}")

    for arquivo in sorted((AQUI / "f").glob("*/*.flow.json")):
        caminho = str(arquivo.relative_to(AQUI)).removesuffix(".flow.json")
        fluxo = json.loads(arquivo.read_text()) | {"path": caminho}
        if chamar("GET", f"/w/{WS}/flows/get/{caminho}") is None:
            chamar("POST", f"/w/{WS}/flows/create", fluxo)
            print(f"fluxo {caminho} criado")
        else:
            chamar("POST", f"/w/{WS}/flows/update/{caminho}", fluxo)
            print(f"fluxo {caminho} atualizado")


def puxar() -> None:
    for script in chamar("GET", f"/w/{WS}/scripts/list?per_page=500") or []:
        if not script["path"].startswith("f/"):
            continue
        atual = chamar("GET", f"/w/{WS}/scripts/get/p/{script['path']}")
        destino = AQUI / f"{script['path']}.py"
        if not destino.exists() or destino.read_text() != atual["content"]:
            destino.parent.mkdir(parents=True, exist_ok=True)
            destino.write_text(atual["content"])
            print(f"script {script['path']} trazido")
    for item in chamar("GET", f"/w/{WS}/flows/list?per_page=500") or []:
        if not item["path"].startswith("f/"):
            continue
        fluxo = chamar("GET", f"/w/{WS}/flows/get/{item['path']}")
        guardado = {k: fluxo[k] for k in ("summary", "description", "value", "schema")}
        destino = AQUI / f"{item['path']}.flow.json"
        texto = json.dumps(guardado, indent=2, ensure_ascii=False) + "\n"
        if not destino.exists() or destino.read_text() != texto:
            destino.write_text(texto)
            print(f"fluxo {item['path']} trazido")


if __name__ == "__main__":
    {"enviar": enviar, "puxar": puxar}[sys.argv[1] if len(sys.argv) > 1 else "enviar"]()
