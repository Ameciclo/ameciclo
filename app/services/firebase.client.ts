// Firebase configuration para o cliente
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Configuração do Firebase usando as variáveis de ambiente do cliente
function getFirebaseConfig() {
  if (typeof window === 'undefined') {
    throw new Error('Este arquivo deve ser usado apenas no cliente');
  }

  // Acessa as variáveis de ambiente expostas no cliente
  const ENV = (window as any).ENV || {};
  
  return {
    apiKey: ENV.FIREBASE_API_KEY,
    authDomain: ENV.FIREBASE_AUTH_DOMAIN,
    databaseURL: ENV.FIREBASE_DATABASE_URL,
    projectId: ENV.FIREBASE_PROJECT_ID,
    storageBucket: ENV.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: ENV.FIREBASE_MESSAGING_SENDER_ID,
    appId: ENV.FIREBASE_APP_ID,
    measurementId: ENV.FIREBASE_MEASUREMENT_ID
  };
}

// Inicializa o Firebase
let app;
let db;
let rtdb;
let auth;
let storage;

// Inicializa apenas no cliente
if (typeof window !== 'undefined') {
  const firebaseConfig = getFirebaseConfig();
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  rtdb = getDatabase(app);
  auth = getAuth(app);
  storage = getStorage(app);
}

// Exporta os serviços do Firebase
export { app, db, rtdb, auth, storage };
export default app;