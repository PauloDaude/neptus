import { readingsDb } from "@/lib/db";
import { syncReadingsBatch } from "@/lib/api/sync";
import type { Reading } from "@/lib/db/schema";

export interface SyncStatus {
  isSyncing: boolean;
  lastSync: Date | null;
  pendingCount: number;
  error: string | null;
}

export class SyncManager {
  private isSyncing = false;
  private syncCallbacks: Array<(status: SyncStatus) => void> = [];

  /**
   * Subscribe para receber atualizações de status de sincronização
   */
  subscribe(callback: (status: SyncStatus) => void): () => void {
    this.syncCallbacks.push(callback);
    return () => {
      this.syncCallbacks = this.syncCallbacks.filter((cb) => cb !== callback);
    };
  }

  /**
   * Notifica todos os subscribers sobre mudança de status
   */
  private notifySubscribers(status: SyncStatus): void {
    this.syncCallbacks.forEach((cb) => cb(status));
  }

  /**
   * Executa sincronização de leituras pendentes
   */
  async sync(): Promise<{
    syncedCount: number;
    failedCount: number;
    totalPending: number;
  }> {
    // Evita sincronizações simultâneas
    if (this.isSyncing) {
      console.log("Sincronização já em progresso...");
      return { syncedCount: 0, failedCount: 0, totalPending: 0 };
    }

    this.isSyncing = true;

    try {
      // Busca leituras pendentes
      const pendingReadings = await readingsDb.getPending();
      const totalPending = pendingReadings.length;

      if (totalPending === 0) {
        console.log("Nenhuma leitura pendente para sincronizar");
        this.notifySubscribers({
          isSyncing: false,
          lastSync: new Date(),
          pendingCount: 0,
          error: null,
        });
        return { syncedCount: 0, failedCount: 0, totalPending: 0 };
      }

      console.log(`Iniciando sincronização de ${totalPending} leituras...`);

      // Sincroniza em lote
      const result = await syncReadingsBatch(pendingReadings);

      // Marca como sincronizadas
      for (const id of result.syncedIds) {
        await readingsDb.markAsSynced(id);
      }

      // Marca com erro
      for (const reading of result.failedReadings) {
        await readingsDb.markAsError(reading.id, "Tanque inválido ou não encontrado");
      }

      const syncedCount = result.syncedIds.length;
      const failedCount = result.failedReadings.length;

      console.log(
        `Sincronização concluída: ${syncedCount} sincronizadas, ${failedCount} falhadas`
      );

      this.notifySubscribers({
        isSyncing: false,
        lastSync: new Date(),
        pendingCount: failedCount,
        error: result.success ? null : "Algumas leituras falharam",
      });

      return { syncedCount, failedCount, totalPending };
    } catch (error) {
      console.error("Erro fatal durante sincronização:", error);

      this.notifySubscribers({
        isSyncing: false,
        lastSync: null,
        pendingCount: (await readingsDb.getPending()).length,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });

      throw error;
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Retorna status atual
   */
  async getStatus(): Promise<SyncStatus> {
    const pendingCount = (await readingsDb.getPending()).length;
    return {
      isSyncing: this.isSyncing,
      lastSync: null,
      pendingCount,
      error: null,
    };
  }
}

// Instância única do gerenciador
export const syncManager = new SyncManager();
