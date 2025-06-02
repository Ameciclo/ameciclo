// Firebase configuration para o cliente
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { firebaseConfig } from './firebase.config';

// Inicializa o Firebase
let app;
let db;
let rtdb;
let auth;
let storage;

// Inicializa apenas no cliente
if (typeof window !== 'undefined') {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  rtdb = getDatabase(app);
  auth = getAuth(app);
  storage = getStorage(app);
}

// Exporta os serviços do Firebase
export { app, db, rtdb, auth, storage };
export default app;