# Etapa 1: Setup IndexedDB - CONCLUÍDO ✅

## O que foi criado:

### 1. `/src/lib/db/schema.ts`
- Define as interfaces: `Reading`, `Tank`, `Property`
- Cria a classe `AppDatabase` usando Dexie
- Exporta instância única do banco: `db`

### 2. `/src/lib/db/index.ts`
- Funções CRUD simples para cada entidade:
  - `readingsDb`: operações com leituras
  - `tanksDb`: operações com tanques
  - `propertiesDb`: operações com propriedades
- Função `clearAllData()` para limpar tudo

### 3. `/src/lib/db/migration.ts`
- Função `migrateFromLocalStorage()`: migra dados antigos
- Verifica se migração já foi executada
- Marca migração como completa

## Como usar:

### Instalar dependência:
```bash
npm install dexie
```

### Exemplo de uso:
```typescript
import { readingsDb } from '@/lib/db';

// Adicionar nova leitura
const id = await readingsDb.add({
  propertyId: "prop-123",
  tankId: "tank-456",
  turbidity: 15.5,
  syncStatus: "pending"
});

// Buscar leituras
const readings = await readingsDb.getByProperty("prop-123");

// Buscar pendentes de sync
const pending = await readingsDb.getPending();
```

## Próximos passos:
- Migrar componentes que usam localStorage para usar IndexedDB
- Criar sistema de sincronização com servidor
- Implementar hooks React Query

## Status: ✅ PRONTO PARA AVALIAÇÃO
