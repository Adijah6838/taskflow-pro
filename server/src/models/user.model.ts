import db from '../database/db';
import crypto from 'crypto';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Optional so we can omit it when sending back to the client
  role: 'ADMIN' | 'PROJECT_MANAGER' | 'DEVELOPER';
  createdAt: string;
}

export const createUser = (name: string, email: string, hashedPassword: string, role: string): User => {
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO users (id, name, email, password, role, createdAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(id, name, email, hashedPassword, role, createdAt);

  return { id, name, email, role: role as any, createdAt };
};

export const findUserByEmail = (email: string): User | undefined => {
  const stmt = db.prepare(`SELECT * FROM users WHERE email = ?`);
  return stmt.get(email) as User | undefined;
};

export const findUserById = (id: string): User | undefined => {
  const stmt = db.prepare(`SELECT id, name, email, role, createdAt FROM users WHERE id = ?`);
  return stmt.get(id) as User | undefined;
};