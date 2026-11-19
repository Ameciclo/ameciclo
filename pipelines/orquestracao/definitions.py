"""O mesmo pipeline do DATASUS, no Dagster: cada etapa é uma tabela (asset), e o dbt entra inteiro pelo dagster-dbt.

    lago/datasus_sim (por ano) -> datasus/datasus_sim (raw, por ano) -> stg_datasus__obitos -> sinistros_fatais
                                                                                               -> meta/publicacao_datasus
"""

from datetime import date
from pathlib import Path

import dagster as dg
from dagster_dbt import DbtCliResource, DbtProject, dbt_assets

from ingest import datasus, db

PIPELINES = Path(__file__).resolve().parent.parent
dbt_project = DbtProject(project_dir=PIPELINES / "transform", profiles_dir=PIPELINES / "transform")
dbt_project.prepare_if_dev()

anos = dg.StaticPartitionsDefinition([str(ano) for ano in range(2011, date.today().year + 1)])


class ObterConfig(dg.Config):
    pasta: str = "/data/mortes"  # vazio = baixar do FTP do DATASUS
    forcar: bool = False


class CarregarConfig(dg.Config):
    forcar: bool = False


@dg.asset(
    key=["lago", "datasus_sim"],
    partitions_def=anos,
    group_name="datasus",
    kinds={"python", "file"},
    description="Arquivo do SIM no lago, guardado pelo hash. Igual ao último = nada muda.",
)
def arquivo_datasus(context: dg.AssetExecutionContext, config: ObterConfig) -> dg.MaterializeResult:
    result = datasus.obter(int(context.partition_key), Path(config.pasta) if config.pasta else None, config.forcar)
    if result is None:
        return dg.MaterializeResult(metadata={"situação": "baixado há menos de 24 h"})
    entry, novo = result
    return dg.MaterializeResult(
        metadata={"arquivo": entry.arquivo, "sha256": entry.sha256, "origem": entry.origem, "novo": novo}
    )


@dg.asset(
    # O mesmo nome da source do dbt (datasus.datasus_sim): é assim que o Dagster liga a ingestão aos modelos.
    key=["datasus", "datasus_sim"],
    deps=[arquivo_datasus],
    partitions_def=anos,
    group_name="datasus",
    kinds={"python", "postgres"},
    description="raw.datasus_sim: o arquivo do lago como veio, tudo texto.",
)
def raw_datasus(context: dg.AssetExecutionContext, config: CarregarConfig) -> dg.MaterializeResult:
    result = datasus.carregar(int(context.partition_key), config.forcar)
    if result is None:
        return dg.MaterializeResult(metadata={"situação": "este arquivo já estava no banco"})
    carga, linhas = result
    return dg.MaterializeResult(metadata={"carga": carga, "linhas": linhas})


@dbt_assets(manifest=dbt_project.manifest_path, project=dbt_project)
def modelos_dbt(context: dg.AssetExecutionContext, dbt: DbtCliResource):
    # Os testes do dbt viram asset checks; teste do staging que falha deixa o mart sem ser refeito.
    yield from dbt.cli(["build"], context=context).stream()


@dg.asset(
    key=["meta", "publicacao_datasus"],
    deps=[dg.AssetKey(["marts", "sinistros_fatais"])],
    group_name="datasus",
    kinds={"python", "postgres"},
    description="Marca as cargas do DATASUS como publicadas em meta.carga.",
)
def publicacao_datasus() -> dg.MaterializeResult:
    with db.connect() as conn:
        return dg.MaterializeResult(metadata={"cargas publicadas": db.publish(conn, "datasus.sim")})


# Ingestão por ano (escolhe-se o ano na interface); transformação e publicação uma vez, para todos os anos.
ingestao_datasus = dg.define_asset_job(
    "ingestao_datasus", selection=dg.AssetSelection.assets(arquivo_datasus, raw_datasus), partitions_def=anos
)
transformacao_datasus = dg.define_asset_job(
    "transformacao_datasus", selection=dg.AssetSelection.assets(modelos_dbt, publicacao_datasus)
)


# Depois de qualquer ingestão que der certo, roda a transformação sozinho.
@dg.run_status_sensor(
    run_status=dg.DagsterRunStatus.SUCCESS,
    monitored_jobs=[ingestao_datasus],
    request_job=transformacao_datasus,
    default_status=dg.DefaultSensorStatus.RUNNING,
)
def transformar_depois_da_ingestao(context: dg.RunStatusSensorContext):
    return dg.RunRequest(run_key=context.dagster_run.run_id)


# Todo dia 5, às 7 h: o ano corrente (como a agenda do Dagu). Desligada por padrão no protótipo.
@dg.schedule(
    cron_schedule="0 7 5 * *",
    execution_timezone="America/Recife",
    job=ingestao_datasus,
    default_status=dg.DefaultScheduleStatus.STOPPED,
)
def agenda_mensal_datasus(context: dg.ScheduleEvaluationContext):
    ano = str(context.scheduled_execution_time.year)
    return dg.RunRequest(partition_key=ano, run_key=f"{ano}-{context.scheduled_execution_time:%m}")


defs = dg.Definitions(
    assets=[arquivo_datasus, raw_datasus, modelos_dbt, publicacao_datasus],
    jobs=[ingestao_datasus, transformacao_datasus],
    schedules=[agenda_mensal_datasus],
    sensors=[transformar_depois_da_ingestao],
    resources={"dbt": DbtCliResource(project_dir=dbt_project)},
)
