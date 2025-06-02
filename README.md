# Ameciclo

## Configuração do Firebase

Este projeto utiliza o Firebase como banco de dados. Para configurar o Firebase, siga os passos abaixo:

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
2. Adicione um aplicativo web ao seu projeto
3. Copie as credenciais do Firebase
4. Crie um arquivo `.env` na raiz do projeto com base no arquivo `.env.example`
5. Preencha as variáveis de ambiente com as credenciais do Firebase

### Variáveis de ambiente

```
# Firebase Configuration - Cliente
FIREBASE_API_KEY=sua_api_key
FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
FIREBASE_DATABASE_URL=https://seu_projeto-default-rtdb.firebaseio.com
FIREBASE_PROJECT_ID=seu_projeto_id
FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
FIREBASE_APP_ID=seu_app_id
FIREBASE_MEASUREMENT_ID=seu_measurement_id

# Firebase Admin Configuration - Servidor
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxx@seu_projeto.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX\n-----END PRIVATE KEY-----\n"
```

### Configuração do Firebase Admin

Para usar o Firebase Admin SDK, você precisa gerar uma chave privada:

1. No Firebase Console, vá para Configurações > Contas de serviço
2. Clique em "Gerar nova chave privada"
3. Baixe o arquivo JSON
4. Copie os valores para as variáveis de ambiente `FIREBASE_CLIENT_EMAIL` e `FIREBASE_PRIVATE_KEY`

## Desenvolvimento

```bash
npm install
npm run dev
```

## Produção

```bash
npm run build
npm start
```

## Firebase Realtime Database Integration

O projeto utiliza o Firebase Realtime Database para armazenar dados localmente, sem depender de APIs externas.

### Configuração

1. Configure as variáveis de ambiente conforme o arquivo `.env.example`
2. Todas as credenciais sensíveis devem estar no arquivo `.env` (não incluído no controle de versão)

### Funcionalidades

- Os dados são armazenados localmente no Firebase Realtime Database
- O sistema verifica a necessidade de atualização dos dados com base na data da última atualização
- Não há mais chamadas diretas a APIs externas, garantindo maior controle e segurança dos dados

### Serviços Disponíveis

- `env.server.ts`: Gerenciamento de variáveis de ambiente
- `firebase.config.ts`: Configuração do Firebase usando variáveis de ambiente
- `firebaseRealtimeAdmin.server.ts`: Configuração do Firebase Admin SDK para o Realtime Database
- `firebaseRealtimeService.server.ts`: Serviço com métodos para interagir com o Realtime Database
- `loaDataService.server.ts`: Serviço específico para gerenciar dados da LOA