# O lago: onde ficam os arquivos brutos, datados e imutáveis, de onde qualquer tabela pode ser refeita.
#
# Cada arquivo é guardado pelo hash do conteúdo (raw/<fonte>/<partição>/<sha>.<ext>), então guardar o mesmo arquivo
# duas vezes não duplica nada. Ao lado fica latest.json, com o último arquivo daquela partição e de onde veio.
# No protótipo o lago é uma pasta do worker; no servidor será o R2 (só este script muda).
#
# Script de apoio: os passos importam daqui com `from f.pipelines.lago import ...`.

import hashlib
import json
import shutil
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path


@dataclass
class Entrada:
    fonte: str
    particao: str
    arquivo: str  # caminho relativo à raiz do lago
    sha256: str
    origem: str  # de onde veio (URL do FTP, pasta local...)
    obtido_em: str  # ISO 8601, UTC


def sha256_de(caminho: Path) -> str:
    digest = hashlib.sha256()
    with caminho.open("rb") as f:
        for bloco in iter(lambda: f.read(1 << 20), b""):
            digest.update(bloco)
    return digest.hexdigest()


def _pasta(raiz: Path, fonte: str, particao: str) -> Path:
    return raiz / "raw" / fonte.replace(".", "/") / particao


def ultima(raiz: Path, fonte: str, particao: str) -> Entrada | None:
    arquivo = _pasta(raiz, fonte, particao) / "latest.json"
    return Entrada(**json.loads(arquivo.read_text())) if arquivo.exists() else None


def guardar(raiz: Path, fonte: str, particao: str, origem_arquivo: Path, origem: str) -> tuple[Entrada, bool]:
    """Guarda o arquivo no lago. Devolve a entrada e se ele é novo (diferente do último daquela partição)."""
    sha = sha256_de(origem_arquivo)
    anterior = ultima(raiz, fonte, particao)
    pasta = _pasta(raiz, fonte, particao)
    pasta.mkdir(parents=True, exist_ok=True)
    destino = pasta / f"{sha[:16]}{origem_arquivo.suffix}"
    if not destino.exists():
        shutil.copyfile(origem_arquivo, destino)
    entrada = Entrada(fonte, particao, str(destino.relative_to(raiz)), sha, origem, datetime.now(timezone.utc).isoformat())
    (pasta / "latest.json").write_text(json.dumps(asdict(entrada), indent=2, ensure_ascii=False))
    return entrada, anterior is None or anterior.sha256 != sha


def caminho(raiz: Path, entrada: Entrada) -> Path:
    return raiz / entrada.arquivo
