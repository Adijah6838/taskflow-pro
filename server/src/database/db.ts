import Database from 'better-sqlite3';
import path from 'path';
import { env } from '../config/env';

// Define the path to the SQLite file
const dbPath = path.resolve(__dirname, '../../../', env.DATABASE_URL);

// Initialize the database connection
const db = new Database(dbPath, { verbose: console.log });

// Enable foreign key constraints (CRITICAL for relational integrity)
db.pragma('foreign_keys = ON');

export default db;