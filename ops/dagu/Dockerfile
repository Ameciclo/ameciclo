# Dagu (agendador de fluxos com interface web) rodando os pipelines da Ameciclo.
# - Python (pipelines/ingest): OSM (ciclovias, bicicletários) e a malha viária da Prefeitura, com o ambiente do
#   pipelines/uv.lock em /opt/venv. Os arquivos brutos ficam no lago, em /var/lib/dagu/lake (o volume do Dagu).
# - TypeScript (packages/db/scripts), só o importador antigo do DATASUS até o fluxo novo (pipelines/dags) ir para
#   produção: compilado aqui para um .mjs, com as dependências dentro.
# Build context: a raiz do repositório.
#   docker build -f ops/dagu/Dockerfile -t ameciclo-dagu .

FROM node:24-slim AS scripts
RUN corepack enable
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
RUN pnpm --filter @ameciclo/db db:bundle-scripts

FROM ghcr.io/dagucloud/dagu:latest
COPY --from=scripts /usr/local/bin/node /usr/local/bin/node
COPY --from=scripts /app/packages/db/dist-scripts /opt/scripts
COPY --from=ghcr.io/astral-sh/uv:0.9.7 /uv /usr/local/bin/uv
ENV UV_PROJECT_ENVIRONMENT=/opt/venv \
    UV_PYTHON_INSTALL_DIR=/opt/python \
    UV_LINK_MODE=copy
WORKDIR /opt/pipelines
COPY pipelines/pyproject.toml pipelines/uv.lock pipelines/.python-version ./
RUN uv sync --frozen --no-install-project --no-dev && chmod -R a+rX /opt/venv /opt/python
COPY pipelines/ingest ingest
COPY ops/dagu/dags /opt/dags
COPY ops/dagu/avisar.sh ops/dagu/com-banco.sh /opt/scripts/
# O Dagu roda como o usuário dagu e grava ao lado dos fluxos
# (o entrypoint troca o uid dele para PUID, 1000 por padrão).
RUN mkdir -p /var/lib/dagu/lake && chown -R 1000:1000 /opt/dags /opt/scripts /opt/pipelines /var/lib/dagu/lake
ENV DAGU_DAGS_DIR=/opt/dags \
    DAGU_HOST=0.0.0.0 \
    DAGU_PORT=8080 \
    DAGU_TZ=America/Recife \
    DAGU_AUTH_MODE=builtin \
    LAKE_DIR=/var/lib/dagu/lake
