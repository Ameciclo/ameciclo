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

O projeto agora inclui integração com o Firebase Realtime Database para armazenar os dados da API CKAN.

### Configuração

1. Substitua o arquivo `app/services/serviceAccountKey.json` com suas credenciais reais do Firebase
2. Ou configure as variáveis de ambiente conforme o arquivo `.env.example`

### Funcionalidades

- Os dados da API CKAN são automaticamente salvos no Firebase Realtime Database quando a página `/dados/abertos` é acessada
- Os dados são salvos em um documento chamado `dadosLOA` no banco de dados
- O salvamento ocorre apenas quando os dados são buscados da API (não quando são recuperados do cache)

### Serviços Disponíveis

- `firebaseRealtimeAdmin.server.ts`: Configuração do Firebase Admin SDK para o Realtime Database
- `firebaseRealtimeService.server.ts`: Serviço com métodos para interagir com o Realtime Database (set, push, get, update, remove)
