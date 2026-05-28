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

    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS schedule (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL,
      week_start TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(member_id) REFERENCES members(id)
    );

    CREATE INDEX IF NOT EXISTS idx_members_active ON members(active);
    CREATE INDEX IF NOT EXISTS idx_schedule_week_start ON schedule(week_start);
    CREATE INDEX IF NOT EXISTS idx_schedule_member_id ON schedule(member_id);
  `);
}

initializeDatabase();

export const db = drizzle(sqlite);
