# Build context: the repository root.
#   docker build -f apps/collector/Dockerfile -t ameciclo-collector .
#
# The container only idles. Coolify's scheduled task runs the collection inside
# it, weekly:  pnpm --filter @ameciclo/collector collect
FROM node:24-slim
RUN corepack enable
WORKDIR /app

# Every workspace manifest, so that the frozen lockfile still matches.
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/package.json apps/web/
COPY apps/admin/package.json apps/admin/
COPY apps/sync/package.json apps/sync/
COPY apps/collector/package.json apps/collector/
COPY packages/db/package.json packages/db/
COPY packages/ui/package.json packages/ui/
RUN pnpm install --frozen-lockfile --filter @ameciclo/collector...

COPY packages/db packages/db
COPY apps/collector apps/collector

CMD ["sleep", "infinity"]
