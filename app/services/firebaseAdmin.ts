/**
 * Este arquivo configura o Firebase Admin SDK para uso em ambiente de servidor
 * Útil para operações de backend seguras e autenticação de servidor
 */

// Nota: Este arquivo é apenas um exemplo e deve ser configurado com suas credenciais
// Para produção, você deve armazenar suas credenciais como variáveis de ambiente

import admin from 'firebase-admin';

// Verifica se o Firebase Admin já foi inicializado para evitar inicializações múltiplas
let firebaseAdmin: admin.app.App;

if (!admin.apps.length) {
  // Para ambiente de produção, use variáveis de ambiente
  if (process.env.FIREBASE_ADMIN_CREDENTIALS) {
    // Usando credenciais de variáveis de ambiente (recomendado para produção)
    const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS);
    
    firebaseAdmin = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });
  } else {
    // Configuração alternativa para desenvolvimento
    // Nota: Para produção, sempre use variáveis de ambiente
    firebaseAdmin = admin.initializeApp({
      // Se você não tiver as credenciais como variável de ambiente,
      // você pode importar o arquivo JSON diretamente (apenas para desenvolvimento)
      // credential: admin.credential.cert(require('caminho/para/serviceAccountKey.json')),
      
      // Ou usar a detecção automática de credenciais (funciona no Google Cloud)
      credential: admin.credential.applicationDefault(),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });
  }
} else {
  firebaseAdmin = admin.app();
}

export const adminAuth = firebaseAdmin.auth();
export const adminFirestore = firebaseAdmin.firestore();
export const adminStorage = firebaseAdmin.storage();

export default firebaseAdmin;