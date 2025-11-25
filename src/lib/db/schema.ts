import Dexie, { Table } from "dexie";

// Interfaces dos dados
export interface Reading {
  id: string;
  propertyId: string;
  tankId: string;
  turbidez: number;
  temperatura?: number;
  ph?: number;
  oxigenio?: number;
  amonia?: number;
  imagem_cor?: string;
  createdAt: Date;
  updatedAt: Date;
  syncStatus: "synced" | "pending" | "error";
  syncedAt?: Date;
  errorMessage?: string;
}

export interface Tank {
  id: string;
  propertyId: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  syncStatus: "synced" | "pending" | "error";
}

export interface Property {
  id: string;
  name: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Classe do banco de dados
export class AppDatabase extends Dexie {
  readings!: Table<Reading>;
  tanks!: Table<Tank>;
  properties!: Table<Property>;

  constructor() {
    super("neptus-db");

    // Define o schema
    this.version(1).stores({
      readings: "id, propertyId, tankId, createdAt, syncStatus",
      tanks: "id, propertyId, name",
      properties: "id, name",
    });
  }
}

// Instância única do banco
export const db = new AppDatabase();
