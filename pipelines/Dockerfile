# Dagu com o ambiente dos pipelines (Python 3.12, dbt, psycopg) dentro. Os passos dos fluxos rodam aqui.
# Build context: a pasta pipelines/.
FROM ghcr.io/dagucloud/dagu:latest
COPY --from=ghcr.io/astral-sh/uv:0.9.7 /uv /usr/local/bin/uv
ENV UV_PROJECT_ENVIRONMENT=/opt/venv \
    UV_PYTHON_INSTALL_DIR=/opt/python \
    UV_LINK_MODE=copy
WORKDIR /opt/pipelines
COPY pyproject.toml uv.lock .python-version ./
RUN uv sync --frozen --no-install-project && chmod -R a+rX /opt/venv /opt/python
COPY ingest ingest
COPY transform transform
COPY dags /opt/dags
RUN mkdir -p /var/lib/pipelines/lake && chown -R 1000:1000 /opt/dags /opt/pipelines /var/lib/pipelines
ENV PATH=/opt/venv/bin:$PATH \
    LAKE_DIR=/var/lib/pipelines/lake \
    DBT_PROFILES_DIR=/opt/pipelines/transform \
    DAGU_DAGS_DIR=/opt/dags \
    DAGU_HOST=0.0.0.0 \
    DAGU_PORT=8080 \
    DAGU_TZ=America/Recife
