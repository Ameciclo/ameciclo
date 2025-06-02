import { saveToRealtimeDatabase } from './firebaseRealtimeAdmin.server';
import { RealtimeDatabaseServerService } from './firebaseRealtimeService.server';

/**
 * Serviço para gerenciar dados da LOA (Lei Orçamentária Anual)
 */
export class LoaDataService {
  private static readonly DATA_PATH = 'dadosLOA';
  
  /**
   * Obtém os dados da LOA do banco de dados
   * @returns Dados da LOA ou null se não existirem
   */
  static async getData() {
    try {
      const data = await RealtimeDatabaseServerService.get(this.DATA_PATH);
      return data && data.dados ? data : null;
    } catch (error) {
      console.error('Erro ao obter dados da LOA:', error);
      return null;
    }
  }
  
  /**
   * Salva os dados da LOA no banco de dados
   * @param data Dados a serem salvos
   */
  static async saveData(data: any[]) {
    try {
      await saveToRealtimeDatabase(this.DATA_PATH, {
        dados: data,
        ultimaAtualizacao: Date.now()
      });
      return true;
    } catch (error) {
      console.error('Erro ao salvar dados da LOA:', error);
      return false;
    }
  }
  
  /**
   * Verifica se os dados precisam ser atualizados
   * @param timestamp Timestamp da última atualização
   * @returns true se os dados precisam ser atualizados
   */
  static needsUpdate(timestamp: number): boolean {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000; // 24 horas em milissegundos
    return now - timestamp > oneDayMs;
  }
}