# Runner na VNet do Azure

O Postgres de produção não tem endereço público, então o job `migrate` do
`deploy.yml` roda num runner que fica na mesma VNet (no host do Coolify).

## Por que isso exige cuidado

O repositório é **público**. Um runner próprio dentro da rede de produção só é
seguro se nenhum código de PR conseguir rodar nele. Por isso:

1. **Grupo de runners restrito.** Em Settings da organização, Actions, Runner
   groups: crie um grupo para este runner, deixe só o repositório
   `Ameciclo/ameciclo` e ligue "Selected workflows" apontando para
   `Ameciclo/ameciclo/.github/workflows/deploy.yml@refs/heads/main`. Assim, nem
   um workflow novo num PR consegue usar o runner.
2. **Efêmero.** `EPHEMERAL=true`: cada job roda num contêiner novo.
3. **Ambiente `production`.** O segredo `DATABASE_URL` fica só nesse ambiente, e
   o ambiente só aceita deploy a partir de `main` (Settings, Environments,
   Deployment branches).
4. **Sem docker.sock e sem volumes**, para o job não alcançar o host.
5. Em Settings, Actions, General, deixe "Require approval for all outside
   collaborators".

## Subir

1. Crie um token de acesso para o runner (PAT fine-grained, só neste
   repositório, permissão "Administration: read and write", ou um GitHub App) e
   guarde como `RUNNER_ACCESS_TOKEN` nas variáveis do recurso no Coolify.
2. No Coolify, crie um recurso Docker Compose com `compose.yaml` desta pasta,
   no servidor que está na VNet.
3. Em Settings, Environments, `production`, crie o segredo `DATABASE_URL`:

   `postgresql://ameciclo:SENHA@ameciclo-postgres.postgres.database.azure.com:5432/ameciclo?sslmode=verify-full`

4. O runner aparece em Settings, Actions, Runners com o rótulo `ameciclo-vnet`.

Como o runner é efêmero, o contêiner sai depois de cada job e o Coolify o
reinicia (`restart: unless-stopped`), registrando um novo.
