import { realtimeDb } from './firebaseRealtimeAdmin.server';

/**
 * Serviço para interagir com o Firebase Realtime Database no lado do servidor
 */
export class RealtimeDatabaseServerService {
  /**
   * Salva dados em um caminho específico no Realtime Database
   * @param path Caminho no banco de dados
   * @param data Dados a serem salvos
   */
  static async set(path: string, data: any): Promise<void> {
    try {
      await realtimeDb.ref(path).set(data);
      console.log(`Dados salvos com sucesso em ${path}`);
    } catch (error) {
      console.error(`Erro ao definir dados em ${path}:`, error);
      throw error;
    }
  }

  /**
   * Adiciona dados com uma chave gerada automaticamente
   * @param path Caminho no banco de dados
   * @param data Dados a serem adicionados
   * @returns Chave gerada para o novo registro
   */
  static async push(path: string, data: any): Promise<string> {
    try {
      const newRef = realtimeDb.ref(path).push();
      await newRef.set(data);
      return newRef.key || '';
    } catch (error) {
      console.error(`Erro ao adicionar dados em ${path}:`, error);
      throw error;
    }
  }

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

  /**
   * Atualiza parcialmente os dados em um caminho específico
   * @param path Caminho no banco de dados
   * @param data Dados a serem atualizados
   */
  static async update(path: string, data: any): Promise<void> {
    try {
      await realtimeDb.ref(path).update(data);
    } catch (error) {
      console.error(`Erro ao atualizar dados em ${path}:`, error);
      throw error;
    }
  }

  /**
   * Remove dados de um caminho específico
   * @param path Caminho no banco de dados
   */
  static async remove(path: string): Promise<void> {
    try {
      await realtimeDb.ref(path).remove();
    } catch (error) {
      console.error(`Erro ao remover dados de ${path}:`, error);
      throw error;
    }
  }
}