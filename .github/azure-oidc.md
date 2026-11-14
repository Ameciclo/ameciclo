# Login do GitHub Actions no Azure (OIDC)

O job `migrate` do `deploy.yml` abre uma regra de firewall só para o IP do
runner, migra e fecha a regra. Ele entra no Azure por OIDC, sem senha nem
segredo guardado: o Azure confia em tokens que o GitHub emite para o ambiente
`production` deste repositório.

A identidade só pode criar, ler e apagar regras de firewall **neste servidor**.
Ela não lê dados nem mexe em mais nada.

## Criar a identidade (uma vez)

```bash
SUB=$(az account show --query id -o tsv)
TENANT=$(az account show --query tenantId -o tsv)
SERVER=/subscriptions/$SUB/resourceGroups/ameciclo-rg-prod/providers/Microsoft.DBforPostgreSQL/flexibleServers/ameciclo-postgres-pub

APP_ID=$(az ad app create --display-name ameciclo-github-ci --query appId -o tsv)
az ad sp create --id "$APP_ID"

# Só tokens do ambiente "production" deste repositório são aceitos. O Azure
# compara o subject sem ignorar maiúsculas, e o ambiente no GitHub se chama
# "Production", então registramos as duas grafias.
for env in production Production; do
  az ad app federated-credential create --id "$APP_ID" --parameters "{
    \"name\": \"github-$env\",
    \"issuer\": \"https://token.actions.githubusercontent.com\",
    \"subject\": \"repo:Ameciclo/ameciclo:environment:$env\",
    \"audiences\": [\"api://AzureADTokenExchange\"]
  }"
done

cat > /tmp/firewall-role.json <<JSON
{
  "Name": "Ameciclo Postgres firewall operator",
  "IsCustom": true,
  "Description": "Cria e apaga regras de firewall do Postgres publico da Ameciclo",
  "Actions": [
    "Microsoft.DBforPostgreSQL/flexibleServers/read",
    "Microsoft.DBforPostgreSQL/flexibleServers/firewallRules/read",
    "Microsoft.DBforPostgreSQL/flexibleServers/firewallRules/write",
    "Microsoft.DBforPostgreSQL/flexibleServers/firewallRules/delete",
    "Microsoft.DBforPostgreSQL/locations/azureAsyncOperation/read",
    "Microsoft.DBforPostgreSQL/locations/operationResults/read"
  ],
  "AssignableScopes": ["/subscriptions/$SUB/resourceGroups/ameciclo-rg-prod"]
}
JSON
az role definition create --role-definition @/tmp/firewall-role.json
az role assignment create --assignee "$APP_ID" --role "Ameciclo Postgres firewall operator" --scope "$SERVER"

echo "AZURE_CLIENT_ID=$APP_ID AZURE_TENANT_ID=$TENANT AZURE_SUBSCRIPTION_ID=$SUB"
```

Se o primeiro run reclamar de `AuthorizationFailed` para alguma ação, o erro
diz qual; é só adicionar essa ação à função.

## No GitHub (Settings, Environments, `Production`)

- **Variáveis** (não são segredos): `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`,
  `AZURE_SUBSCRIPTION_ID`, com os valores impressos acima.
- **Segredo** `DATABASE_URL`:
  `postgresql://ameciclo:SENHA@ameciclo-postgres-pub.postgres.database.azure.com:5432/ameciclo?sslmode=verify-full`
- **Deployment branches**: só `main`.

## Limpeza

O job apaga a própria regra (`github-run-<id>`) mesmo se falhar e, ao começar,
apaga sobras de execuções canceladas. Se alguma regra `github-run-*` aparecer
parada no portal, pode apagar.

## Staging (Postgres do Coolify)

O job `migrate` do `deploy-staging.yml` usa a mesma identidade (`ameciclo-github-ci`),
mas abre uma regra no NSG da VM (`ameciclo-k3s-nsg`, porta 15432) em vez de uma
regra do Postgres gerenciado. A identidade só pode criar, ler e apagar regras
**nesse NSG**.

```bash
SUB=$(az account show --query id -o tsv)
APP_ID=$(az ad app list --display-name ameciclo-github-ci --query '[0].appId' -o tsv)
NSG=/subscriptions/$SUB/resourceGroups/ameciclo-rg-prod/providers/Microsoft.Network/networkSecurityGroups/ameciclo-k3s-nsg

# O ambiente do GitHub se chama "staging" (o Azure diferencia maiúsculas).
az ad app federated-credential create --id "$APP_ID" --parameters '{
  "name": "github-staging",
  "issuer": "https://token.actions.githubusercontent.com",
  "subject": "repo:Ameciclo/ameciclo:environment:staging",
  "audiences": ["api://AzureADTokenExchange"]
}'

cat > /tmp/nsg-role.json <<JSON
{
  "Name": "Ameciclo NSG rule operator",
  "IsCustom": true,
  "Description": "Cria e apaga regras do NSG da VM do Coolify (Postgres de staging)",
  "Actions": [
    "Microsoft.Network/networkSecurityGroups/read",
    "Microsoft.Network/networkSecurityGroups/join/action",
    "Microsoft.Network/networkSecurityGroups/securityRules/read",
    "Microsoft.Network/networkSecurityGroups/securityRules/write",
    "Microsoft.Network/networkSecurityGroups/securityRules/delete",
    "Microsoft.Network/locations/operations/read",
    "Microsoft.Network/locations/operationResults/read"
  ],
  "AssignableScopes": ["/subscriptions/$SUB/resourceGroups/ameciclo-rg-prod"]
}
JSON
az role definition create --role-definition @/tmp/nsg-role.json
az role assignment create --assignee "$APP_ID" --role "Ameciclo NSG rule operator" --scope "$NSG"
```

No GitHub (Settings, Environments, `staging`):

- **Variáveis**: `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`
  (os mesmos de produção).
- **Segredo** `STAGING_DATABASE_URL`, **sem** parâmetros de SSL (o job os
  acrescenta e usa o CA de `.github/staging-db-ca.crt`):
  `postgresql://ameciclo:SENHA@db-staging.az.ameciclo.org:15432/ameciclo`

Como na produção, se o primeiro run reclamar de `AuthorizationFailed`, o erro
diz qual ação falta na função.
