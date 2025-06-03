import admin from 'firebase-admin';

interface LoaData {
  dados: any[];
  ultimaAtualizacao: number;
}

export class LoaDataService {
  private static readonly DATA_PATH = 'dadosLOA';
  
  private static getDb() {
    let firebaseAdmin;
    if (!admin.apps.length) {
      try {
        const serviceAccount = {
          type: "service_account",
          project_id: process.env.FIREBASE_PROJECT_ID || '',
          private_key: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
          client_email: process.env.FIREBASE_CLIENT_EMAIL || '',
        };
        
        firebaseAdmin = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
          databaseURL: process.env.FIREBASE_DATABASE_URL
        });
      } catch (error) {
        console.error('Erro ao inicializar Firebase Admin SDK:', error);
        throw error;
      }
    } else {
      firebaseAdmin = admin.app();
    }
    
    return admin.database(firebaseAdmin);
  }
  
  static async getData() {
    try {
      const db = this.getDb();
      const snapshot = await db.ref(this.DATA_PATH).once('value');
      const data = snapshot.exists() ? snapshot.val() : null;
      return data && data.dados ? data : null;
    } catch (error) {
      console.error('Erro ao obter dados da LOA:', error);
      return null;
    }
  }
  
  static async saveData(data: any[]) {
    try {
      const db = this.getDb();
      await db.ref(this.DATA_PATH).set({
        dados: data,
        ultimaAtualizacao: Date.now()
      });
      return true;
    } catch (error) {
      console.error('Erro ao salvar dados da LOA:', error);
      return false;
    }
  }
  
  static needsUpdate(timestamp: number): boolean {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    return now - timestamp > oneDayMs;
  }
  
  static async updateData() {
    try {
      const mockData = this.generateMockData();
      await this.saveData(mockData);
      return mockData;
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
      return [];
    }
  }
  
  private static generateMockData() {
    const data = [];
    const funcoes = ['Saúde', 'Educação', 'Segurança', 'Infraestrutura', 'Meio Ambiente'];
    const programas = ['Programa 1', 'Programa 2', 'Programa 3', 'Programa 4'];
    
    for (let i = 0; i < 50; i++) {
      const randomFuncao = funcoes[Math.floor(Math.random() * funcoes.length)];
      const randomPrograma = programas[Math.floor(Math.random() * programas.length)];
      
      data.push({
        cd_nm_funcao: randomFuncao,
        cd_nm_prog: randomPrograma,
        cd_nm_acao: `Ação ${i + 1}`,
        cd_nm_subacao: `Subação ${i + 1}`,
        cd_nm_subfuncao: `Subfunção de ${randomFuncao}`,
        vlrdotatualizada: Math.floor(Math.random() * 1000000),
        vlrtotalpago: Math.floor(Math.random() * 800000),
        vlrempenhado: Math.floor(Math.random() * 900000),
        vlrliquidado: Math.floor(Math.random() * 700000),
      });
    }
    
    return data;
  }
}