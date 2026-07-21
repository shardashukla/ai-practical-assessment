import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../..');
const defaultDbPath = path.join(projectRoot, 'database', 'app.db');

let db: Database.Database | null = null;

export function getDbPath(): string {
  return process.env.DATABASE_PATH ?? defaultDbPath;
}

/** Returns a singleton database connection (WAL mode, foreign keys enabled). */
export function getDb(): Database.Database {
  if (!db) {
    const dbPath = getDbPath();
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

/** Applies schema.sql and seed-data.sql on first run when the users table is missing. */
export function initializeDatabase(): void {
  const database = getDb();
  const schemaPath = path.join(projectRoot, 'database', 'schema-or-migrations', 'schema.sql');
  const seedPath = path.join(projectRoot, 'database', 'seed-data', 'seed-data.sql');

  const tableExists = database
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
    .get();

  if (!tableExists) {
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    database.exec(schema);
    const seed = fs.readFileSync(seedPath, 'utf-8');
    database.exec(seed);
  }
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}

/** Deletes the database file and re-runs initialization — used by API tests for isolation. */
export function resetDbForTests(): void {
  closeDb();
  const dbPath = getDbPath();
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }
  initializeDatabase();
}
