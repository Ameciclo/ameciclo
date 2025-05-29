import { getDatabase, ref, set, get, push, remove, update, query, orderByChild, equalTo } from "firebase/database";
import { app, rtdb } from "./firebase.client";

export class RealtimeDatabaseService {
  static async set(path: string, data: any): Promise<void> {
    try {
      await set(ref(rtdb, path), data);
    } catch (error) {
      console.error(`Erro ao definir dados em ${path}:`, error);
      throw error;
    }
  }

  static async push(path: string, data: any): Promise<string> {
    try {
      const newRef = push(ref(rtdb, path));
      await set(newRef, data);
      return newRef.key || '';
    } catch (error) {
      console.error(`Erro ao adicionar dados em ${path}:`, error);
      throw error;
    }
  }

  static async get(path: string): Promise<any> {
    try {
      const snapshot = await get(ref(rtdb, path));
      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      console.error(`Erro ao obter dados de ${path}:`, error);
      throw error;
    }
  }

  static async update(path: string, data: any): Promise<void> {
    try {
      await update(ref(rtdb, path), data);
    } catch (error) {
      console.error(`Erro ao atualizar dados em ${path}:`, error);
      throw error;
    }
  }

  static async remove(path: string): Promise<void> {
    try {
      await remove(ref(rtdb, path));
    } catch (error) {
      console.error(`Erro ao remover dados de ${path}:`, error);
      throw error;
    }
  }
}