import { realtimeDb } from './firebaseRealtimeAdmin.server';

export class RealtimeDatabaseServerService {
  static async get(path: string): Promise<any> {
    try {
      const snapshot = await realtimeDb.ref(path).once('value');
      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      console.error(`Erro ao obter dados de ${path}:`, error);
      throw error;
    }
  }
}