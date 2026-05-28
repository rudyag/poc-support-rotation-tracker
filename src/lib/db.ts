import path from "node:path";

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

const dbFilePath = process.env.DATABASE_URL ?? path.join(process.cwd(), "support-rotation-tracker.db");

const sqlite = new Database(dbFilePath);
sqlite.pragma("journal_mode = WAL");

function initializeDatabase() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS support_rotations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      assignee_name TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

initializeDatabase();

export const db = drizzle(sqlite);
