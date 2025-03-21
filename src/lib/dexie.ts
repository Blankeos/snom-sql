import Dexie, { EntityTable } from 'dexie';

// ===========================================================================
// Types
// ===========================================================================
export enum DatabaseType {
  Postgres,
  SQLite,
  MySQL,
}

interface DatabaseConnection {
  id: string;
  database_type: DatabaseType;
  host: string;
  port: string;
  user: string;
  password: string;
  database_name: string;
  database_uri: string;
  schema?: string;
}

interface DatabaseQuery {
  id: string;
  content: string;
  connection_id: string; // Relates to DatabaseConnection
}

interface DexieDatabase extends Dexie {
  databaseConnections: EntityTable<DatabaseConnection, 'id'>;
  databaseQueries: EntityTable<DatabaseQuery, 'id'>;
}

// ===========================================================================
// Dexie
// ===========================================================================
const db = new Dexie('snomsql-db') as DexieDatabase;

db.version(1).stores({
  sheets: '++id, content, created_at, last_opened_at, name, source_url',
});

export { db };
export type { DatabaseConnection };
