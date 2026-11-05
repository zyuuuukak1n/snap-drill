import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { INITIAL_SAMPLE_TESTS } from './storage';
import { TestSet, Question, Subject } from '@/types';

// Ensure data directory exists
const DATA_DIR = process.env.DATA_DIR || path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'snap-drill.sqlite');

let dbInstance: DatabaseSync | null = null;

export function getDatabase(): DatabaseSync {
  if (!dbInstance) {
    dbInstance = new DatabaseSync(DB_PATH);
    initSchema(dbInstance);
  }
  return dbInstance;
}

function initSchema(db: DatabaseSync): void {
  // WAL mode and busy timeout for concurrent safety
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS test_sets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      subject TEXT NOT NULL,
      created_at TEXT NOT NULL,
      source_image_url TEXT,
      questions_json TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_tests_user ON test_sets(user_id);
  `);
}

import { hashPassword, verifyPassword } from './crypto';
export { hashPassword, verifyPassword };

// ============================================================================
// User & Session Operations
// ============================================================================
export interface DbUser {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export function createUser(email: string, password: string, name: string): DbUser {
  const db = getDatabase();
  const id = `user-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  const { hash, salt } = hashPassword(password);
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO users (id, email, password_hash, salt, name, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  stmt.run(id, email.toLowerCase().trim(), hash, salt, name.trim(), now);

  // Automatically seed initial sample tests for new user
  for (const sample of INITIAL_SAMPLE_TESTS) {
    const testId = `sample-${id}-${sample.id}`;
    const testStmt = db.prepare(`
      INSERT INTO test_sets (id, user_id, title, subject, created_at, source_image_url, questions_json)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    testStmt.run(
      testId,
      id,
      sample.title,
      sample.subject,
      sample.createdAt,
      sample.sourceImageUrl || null,
      JSON.stringify(sample.questions)
    );
  }

  return { id, email: email.toLowerCase().trim(), name: name.trim(), created_at: now };
}

export function findUserByEmail(email: string): (DbUser & { password_hash: string; salt: string }) | null {
  const db = getDatabase();
  const stmt = db.prepare(`SELECT * FROM users WHERE email = ?`);
  const row = stmt.get(email.toLowerCase().trim()) as any;
  if (!row) return null;
  return row;
}

export function createSession(userId: string): string {
  const db = getDatabase();
  const token = crypto.randomBytes(32).toString('hex');
  const now = new Date();
  const expires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days session

  const stmt = db.prepare(`
    INSERT INTO sessions (id, user_id, expires_at, created_at)
    VALUES (?, ?, ?, ?)
  `);
  stmt.run(token, userId, expires.toISOString(), now.toISOString());
  return token;
}

export function validateSession(token: string): DbUser | null {
  if (!token) return null;
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT users.id, users.email, users.name, users.created_at, sessions.expires_at
    FROM sessions
    JOIN users ON sessions.user_id = users.id
    WHERE sessions.id = ?
  `);
  const row = stmt.get(token) as any;
  if (!row) return null;

  // Check expiration
  if (new Date(row.expires_at) < new Date()) {
    deleteSession(token);
    return null;
  }

  return {
    id: row.id,
    email: row.email,
    name: row.name,
    created_at: row.created_at,
  };
}

export function deleteSession(token: string): void {
  const db = getDatabase();
  const stmt = db.prepare(`DELETE FROM sessions WHERE id = ?`);
  stmt.run(token);
}

// ============================================================================
// TestSet Operations for a specific user
// ============================================================================
export function getUserTestSets(userId: string): TestSet[] {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT * FROM test_sets WHERE user_id = ? ORDER BY created_at DESC
  `);
  const rows = stmt.all(userId) as any[];

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    subject: r.subject as Subject,
    createdAt: r.created_at,
    sourceImageUrl: r.source_image_url || undefined,
    questions: JSON.parse(r.questions_json),
  }));
}

export function getUserTestSetById(userId: string, testId: string): TestSet | null {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT * FROM test_sets WHERE user_id = ? AND id = ?
  `);
  const row = stmt.get(userId, testId) as any;
  if (!row) return null;

  return {
    id: row.id,
    title: row.title,
    subject: row.subject as Subject,
    createdAt: row.created_at,
    sourceImageUrl: row.source_image_url || undefined,
    questions: JSON.parse(row.questions_json),
  };
}

export function saveUserTestSet(userId: string, test: TestSet): void {
  const db = getDatabase();
  const existing = getUserTestSetById(userId, test.id);

  if (existing) {
    const stmt = db.prepare(`
      UPDATE test_sets
      SET title = ?, subject = ?, source_image_url = ?, questions_json = ?
      WHERE user_id = ? AND id = ?
    `);
    stmt.run(
      test.title,
      test.subject,
      test.sourceImageUrl || null,
      JSON.stringify(test.questions),
      userId,
      test.id
    );
  } else {
    const stmt = db.prepare(`
      INSERT INTO test_sets (id, user_id, title, subject, created_at, source_image_url, questions_json)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      test.id,
      userId,
      test.title,
      test.subject,
      test.createdAt,
      test.sourceImageUrl || null,
      JSON.stringify(test.questions)
    );
  }
}

export function deleteUserTestSet(userId: string, testId: string): boolean {
  const db = getDatabase();
  const stmt = db.prepare(`DELETE FROM test_sets WHERE user_id = ? AND id = ?`);
  const result = stmt.run(userId, testId);
  return result.changes > 0;
}
