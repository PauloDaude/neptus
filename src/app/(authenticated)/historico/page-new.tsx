"use client";

import { useEffect, useRef, useState } from "react";

import HistoryItem from "@/components/HistoryItem";
import LoadingSpinner from "@/components/LoadingSpinner";
import PageHeader from "@/components/PageHeader";
import { useReadings } from "@/hooks/useReadings";

const HistoricoPage = () => {
  // TODO: Obter tankId do contexto/parametro
  const [tankId] = useState("3f40c989-478f-4323-8f80-83d285837f5c");
  const { readings, isLoading, isLoadingMore, error, hasMorePages, loadMore } =
    useReadings({ tankId, perPage: 50 });

  const observerTarget = useRef<HTMLDivElement>(null);

  // Infinite scroll com Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMorePages && !isLoadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMorePages, isLoadingMore, loadMore]);

  if (isLoading) {
    return (
      <main className="space-y-5">
        <PageHeader
          title="Histórico de registros"
          description="Carregando..."
        />
        <div className="flex justify-center py-10">
          <LoadingSpinner />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="space-y-5">
        <PageHeader
          title="Histórico de registros"
          description="Filtre pela data"
        />
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          Erro ao carregar leituras: {error}
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-5">
      <PageHeader
        title="Histórico de registros"
        description="Carregando dados..."
      />

      <div className="flex flex-col gap-4">
        {readings.length === 0 ? (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
            Nenhuma leitura encontrada
          </div>
        ) : (
          <>
            {readings.map((reading) => (
              <HistoryItem
                key={reading.id}
                id={reading.id}
                time={new Date(reading.createdAt).toLocaleTimeString("pt-BR")}
                date={new Date(reading.createdAt).toLocaleDateString("pt-BR")}
                tankName={reading.tankId}
                turbidity={reading.turbidez}
                temperature={reading.temperatura || 0}
                quality="Bom"
                oxygen={reading.oxigenio || 0}
                ph={reading.ph || 0}
                ammonia={reading.amonia || 0}
                waterColor={0}
                onEdit={() => {}}
              />
            ))}

            {/* Elemento sentinela para infinite scroll */}
            <div ref={observerTarget} className="py-4">
              {isLoadingMore && (
                <div className="flex justify-center">
                  <LoadingSpinner />
                </div>
              )}
              {!hasMorePages && readings.length > 0 && (
                <div className="text-center text-gray-500 text-sm py-4">
                  Todas as leituras carregadas
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default HistoricoPage;
