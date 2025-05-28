import { FirebaseService } from './firebaseService';
import { where, orderBy, limit } from 'firebase/firestore';

export interface LoaData {
  cd_nm_funcao?: string;
  cd_nm_prog?: string;
  cd_nm_acao?: string;
  cd_nm_subacao?: string;
  cd_nm_subfuncao?: string;
  vlrdotatualizada?: number;
  vlrtotalpago?: number;
  vlrempenhado?: number;
  vlrliquidado?: number;
  timestamp?: number;
}

export class LoaDataService {
  private static collectionName = 'loaData';

  static async addLoaData(data: LoaData): Promise<string> {
    const firestoreData = {
      ...data,
      timestamp: Date.now()
    };
    
    return FirebaseService.add(this.collectionName, firestoreData);
  }

  static async getAllLoaData() {
    return FirebaseService.getAll(this.collectionName);
  }

  static async getLoaDataById(id: string) {
    return FirebaseService.getById(this.collectionName, id);
  }

  static async updateLoaData(id: string, data: Partial<LoaData>) {
    return FirebaseService.update(this.collectionName, id, data);
  }

  static async deleteLoaData(id: string) {
    return FirebaseService.delete(this.collectionName, id);
  }
  
  static async getLoaDataByFunction(functionName: string) {
    return FirebaseService.query(
      this.collectionName, 
      [where('cd_nm_funcao', '==', functionName)]
    );
  }
  
  static async getRecentLoaData(count: number = 10) {
    return FirebaseService.query(
      this.collectionName, 
      [orderBy('timestamp', 'desc'), limit(count)]
    );
  }
}