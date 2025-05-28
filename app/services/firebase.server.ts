// Firebase configuration para o servidor
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

// Inicializa o Firebase Admin apenas uma vez
function getFirebaseAdmin() {
  const apps = getApps();
  
  if (apps.length > 0) {
    return {
      app: apps[0],
      db: getFirestore(),
      auth: getAuth(),
      storage: getStorage()
    };
  }

  // Configuração do Firebase Admin
  const app = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });

  return {
    app,
    db: getFirestore(app),
    auth: getAuth(app),
    storage: getStorage(app)
  };
}

// Exporta os serviços do Firebase Admin
export const { app, db, auth, storage } = getFirebaseAdmin();