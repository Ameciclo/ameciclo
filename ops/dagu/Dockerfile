# Dagu (agendador de fluxos com interface web) com o que os fluxos da Ameciclo precisam:
# Python (conversão dos .dbc do DATASUS) e Node + pnpm (importadores do packages/db).
# Build context: a raiz do repositório.
#   docker build -f ops/dagu/Dockerfile -t ameciclo-dagu .
FROM ghcr.io/dagucloud/dagu:latest

RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 python3-venv python3-dev build-essential ca-certificates curl gnupg \
 && curl -fsSL https://deb.nodesource.com/setup_24.x | bash - \
 && apt-get install -y --no-install-recommends nodejs \
 && corepack enable \
 && rm -rf /var/lib/apt/lists/*

RUN python3 -m venv /opt/py && /opt/py/bin/pip install --no-cache-dir datasus-dbc dbfread
ENV PATH="/opt/py/bin:${PATH}"

# O pnpm fica na imagem, em um diretório que o usuário dagu lê.
ENV COREPACK_HOME=/opt/corepack COREPACK_ENABLE_DOWNLOAD_PROMPT=0
WORKDIR /app
# Todos os manifests do workspace, para o lockfile congelado continuar valendo.
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/package.json apps/web/
COPY apps/admin/package.json apps/admin/
COPY apps/collector/package.json apps/collector/
COPY packages/db/package.json packages/db/
COPY packages/ui/package.json packages/ui/
RUN pnpm install --frozen-lockfile --filter @ameciclo/db...
COPY packages/db packages/db

# Os fluxos ficam fora de /var/lib/dagu, que é o volume com o histórico.
COPY ops/dagu/dags /opt/dags
# O Dagu roda como o usuário dagu e grava ao lado dos fluxos e do código.
# (o entrypoint do Dagu troca o uid do usuário dagu para PUID, 1000 por padrão)
RUN chown -R 1000:1000 /opt/dags /app /opt/corepack
ENV DAGU_DAGS_DIR=/opt/dags \
    DAGU_HOST=0.0.0.0 \
    DAGU_PORT=8080 \
    DAGU_TZ=America/Recife \
    DAGU_AUTH_MODE=builtin
