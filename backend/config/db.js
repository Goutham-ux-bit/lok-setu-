const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || './database/loksetu.db';
const resolvedPath = path.isAbsolute(DB_PATH) ? DB_PATH : path.join(__dirname, '..', DB_PATH);

// Make sure the folder that holds the .db file exists.
fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });

let db;
try {
  // Use Node.js built-in SQLite engine (available in Node 22+)
  const { DatabaseSync } = require('node:sqlite');
  db = new DatabaseSync(resolvedPath);
  db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA foreign_keys = ON');
} catch (e) {
  // Fallback to better-sqlite3 if on older Node
  const Database = require('better-sqlite3');
  db = new Database(resolvedPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
}

// Run schema.sql on every boot - all statements use CREATE TABLE IF NOT EXISTS,
// so this is safe to run repeatedly and requires no separate migration step.
const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');
db.exec(schema);

module.exports = db;
