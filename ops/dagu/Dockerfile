# Dagu (agendador de fluxos com interface web) rodando scripts autônomos da Ameciclo.
# Os scripts nascem no monorepo (packages/db/scripts, em TypeScript) e são compilados aqui para um único
# arquivo .mjs cada, com as dependências dentro: no Dagu só entram o Node e esses arquivos, sem pnpm nem repo.
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
COPY ops/dagu/dags /opt/dags
COPY ops/dagu/avisar.sh /opt/scripts/avisar.sh
# O Dagu roda como o usuário dagu e grava ao lado dos fluxos
# (o entrypoint troca o uid dele para PUID, 1000 por padrão).
RUN chown -R 1000:1000 /opt/dags /opt/scripts
ENV DAGU_DAGS_DIR=/opt/dags \
    DAGU_HOST=0.0.0.0 \
    DAGU_PORT=8080 \
    DAGU_TZ=America/Recife \
    DAGU_AUTH_MODE=builtin
