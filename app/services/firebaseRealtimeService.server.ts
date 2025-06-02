import { realtimeDb } from './firebaseRealtimeAdmin.server';

/**
 * Serviço para interagir com o Firebase Realtime Database no lado do servidor
 */
export class RealtimeDatabaseServerService {
  /**
   * Obtém dados de um caminho específico
   * @param path Caminho no banco de dados
   * @returns Dados obtidos ou null se não existirem
   */
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