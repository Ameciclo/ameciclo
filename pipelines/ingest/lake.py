"""O lago: onde ficam os arquivos brutos, datados e imutáveis, de onde qualquer tabela pode ser refeita.

Cada arquivo é guardado pelo hash do conteúdo (raw/<fonte>/<partição>/<sha>.<ext>), então guardar o mesmo arquivo duas
vezes não duplica nada. Ao lado fica latest.json, com o último arquivo obtido daquela partição e de onde veio.

No protótipo o lago é uma pasta local (LAKE_DIR). No servidor será o R2: só este módulo muda.
"""

import hashlib
import json
import os
import shutil
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(os.environ.get("LAKE_DIR", Path(__file__).resolve().parent.parent / "lake"))


@dataclass
class Entry:
    fonte: str
    particao: str
    arquivo: str  # caminho relativo ao lago
    sha256: str
    origem: str  # de onde veio (URL do FTP, pasta local...)
    obtido_em: str  # ISO 8601, UTC


def sha256_of(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _dir(fonte: str, particao: str) -> Path:
    return ROOT / "raw" / fonte.replace(".", "/") / particao


def latest(fonte: str, particao: str) -> Entry | None:
    path = _dir(fonte, particao) / "latest.json"
    return Entry(**json.loads(path.read_text())) if path.exists() else None


def put(fonte: str, particao: str, source_file: Path, origem: str) -> tuple[Entry, bool]:
    """Guarda o arquivo no lago. Devolve a entrada e se ele é novo (diferente do último daquela partição)."""
    sha = sha256_of(source_file)
    previous = latest(fonte, particao)
    target_dir = _dir(fonte, particao)
    target_dir.mkdir(parents=True, exist_ok=True)
    target = target_dir / f"{sha[:16]}{source_file.suffix}"
    if not target.exists():
        shutil.copyfile(source_file, target)
    entry = Entry(fonte, particao, str(target.relative_to(ROOT)), sha, origem, datetime.now(timezone.utc).isoformat())
    (target_dir / "latest.json").write_text(json.dumps(asdict(entry), indent=2, ensure_ascii=False))
    return entry, previous is None or previous.sha256 != sha


def path_of(entry: Entry) -> Path:
    return ROOT / entry.arquivo
