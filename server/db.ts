import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configuração da pool de conexões
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 20, // número máximo de conexões
  idleTimeoutMillis: 30000, // tempo máximo que uma conexão pode ficar ociosa
  connectionTimeoutMillis: 2000, // tempo máximo para estabelecer uma conexão
});

// Evento para quando uma conexão é estabelecida
pool.on('connect', () => {
  console.log('Nova conexão estabelecida com o banco de dados');
});

// Evento para quando uma conexão é fechada
pool.on('remove', () => {
  console.log('Conexão com o banco de dados fechada');
});

// Evento para erros na pool
pool.on('error', (err) => {
  console.error('Erro na pool de conexões:', err);
});

// Exporta o cliente Drizzle
export const db = drizzle(pool, { schema });
