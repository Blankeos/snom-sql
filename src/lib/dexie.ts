import Dexie, { EntityTable } from 'dexie';

// ===========================================================================
// Types
// ===========================================================================
export enum DatabaseType {
  Postgres = 'postgres',
  MySQL = 'mysql',
  SQLite = 'sqlite',
}

interface DatabaseConnection {
  id: number;
  database_type: DatabaseType;
  host: string;
  port: string;
  user: string;
  password: string;
  database_name: string;
  database_uri: string;
  nickname?: string;
  schema?: string;
}

interface DatabaseQuery {
  id: number;
  /** Only present if there's it's a query related to a connection. */
  connection_id?: number;
  content: string;
  nickname?: string;
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
  databaseConnections:
    '++id, database_type, host, port, user, password, database_name, database_uri, nickname, schema',
  databaseQueries: '++id, content, connection_id, nickname',
});

export { db };
export type { DatabaseConnection };
