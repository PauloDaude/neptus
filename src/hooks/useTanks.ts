import { useCallback, useEffect, useState } from "react";

import { tanksDb } from "@/lib/db";
import type { Tank as DBTank } from "@/lib/db/schema";
import { AddTankSchema } from "@/schemas/addTank-schema";

export interface Tank {
  id: string;
  name: string;
  type: string;
  fish: string;
  fishCount: number;
  averageWeight: number;
  tankArea: number;
  createdAt: string;
}

/**
 * Hook para gerenciar tanques usando IndexedDB
 * IMPORTANTE: Requer propertyId configurado em localStorage
 */
export const useTanks = () => {
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Converte Tank do IndexedDB para formato do componente
  const convertFromDB = (dbTank: DBTank): Tank => ({
    id: dbTank.id,
    name: dbTank.name,
    type: dbTank.fishType, // Usando fishType como type temporariamente
    fish: dbTank.fishType,
    fishCount: dbTank.fishCount,
    averageWeight: dbTank.fishWeight,
    tankArea: dbTank.area,
    createdAt: dbTank.createdAt.toISOString(),
  });

  // Carregar tanques do IndexedDB
  useEffect(() => {
    const loadTanks = async () => {
      try {
        // Busca propertyId do localStorage
        const propertyId = localStorage.getItem("propertyId");

        if (!propertyId) {
          console.warn(
            "⚠️ PropertyId não configurado. Configure com: localStorage.setItem('propertyId', 'seu-property-id-aqui')"
          );
          setTanks([]);
          setIsLoading(false);
          return;
        }

        // Busca tanques do IndexedDB
        const dbTanks = await tanksDb.getByProperty(propertyId);

        // Converte para formato do componente
        const convertedTanks = dbTanks.map(convertFromDB);

        setTanks(convertedTanks);
      } catch (error) {
        console.error("Erro ao carregar tanques do IndexedDB:", error);
        setTanks([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTanks();
  }, []);

  // Recarregar tanques do IndexedDB
  const reloadTanks = useCallback(async () => {
    try {
      const propertyId = localStorage.getItem("propertyId");
      if (!propertyId) {
        setTanks([]);
        return;
      }

      const dbTanks = await tanksDb.getByProperty(propertyId);
      const convertedTanks = dbTanks.map(convertFromDB);
      setTanks(convertedTanks);
    } catch (error) {
      console.error("Erro ao recarregar tanques:", error);
    }
  }, []);

  // Adicionar tanque (salva no IndexedDB com status pending)
  const addTank = useCallback(
    async (tankData: AddTankSchema) => {
      try {
        const propertyId = localStorage.getItem("propertyId");
        if (!propertyId) {
          throw new Error("PropertyId não configurado");
        }

        const userId = "local-user"; // TODO: Pegar do session

        const id = await tanksDb.add({
          propertyId,
          userId,
          name: tankData.name,
          area: tankData.tankArea,
          fishType: tankData.fish,
          fishWeight: tankData.averageWeight,
          fishCount: tankData.fishCount,
          active: true,
        });

        // Recarrega a lista
        await reloadTanks();

        return { id, ...tankData, createdAt: new Date().toISOString() } as Tank;
      } catch (error) {
        console.error("Erro ao adicionar tanque:", error);
        throw error;
      }
    },
    [reloadTanks]
  );

  // Atualizar tanque (não implementado ainda - requer API)
  const updateTank = useCallback(
    async (id: string, tankData: AddTankSchema) => {
      console.warn("updateTank não implementado - requer API de atualização");
      // TODO: Implementar quando houver API de update
    },
    []
  );

  // Deletar tanque (não implementado ainda - requer API)
  const deleteTank = useCallback(async (id: string) => {
    console.warn("deleteTank não implementado - requer API de deleção");
    // TODO: Implementar quando houver API de delete
  }, []);

  // Buscar tanque por ID
  const getTankById = useCallback(
    (id: string) => {
      return tanks.find((tank) => tank.id === id);
    },
    [tanks]
  );

  return {
    tanks,
    isLoading,
    addTank,
    updateTank,
    deleteTank,
    getTankById,
  };
};
