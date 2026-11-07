import db from '../database/db';
import crypto from 'crypto';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  projectId: string;
  assignedUserId: string | null;
  createdBy: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED';
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  updatedBy: string | null;
}

export const createTask = (data: Partial<Task>, createdBy: string): Task => {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO tasks (id, title, description, projectId, assignedUserId, createdBy, priority, status, dueDate, createdAt, updatedAt, updatedBy)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    data.title,
    data.description || null,
    data.projectId,
    data.assignedUserId || null,
    createdBy,
    data.priority || 'MEDIUM',
    data.status || 'TODO',
    data.dueDate || null,
    now,
    now,
    createdBy
  );

  return getTaskById(id) as Task;
};

export const getTaskById = (id: string): Task | undefined => {
  const stmt = db.prepare(`SELECT * FROM tasks WHERE id = ?`);
  return stmt.get(id) as Task | undefined;
};

export const getTasks = (projectId: string, filters: any): Task[] => {
  let query = `SELECT * FROM tasks WHERE projectId = ?`;
  const params: any[] = [projectId];

  if (filters.search) {
    query += ` AND title LIKE ?`;
    params.push(`%${filters.search}%`);
  }
  if (filters.priority) {
    query += ` AND priority = ?`;
    params.push(filters.priority);
  }
  if (filters.status) {
    query += ` AND status = ?`;
    params.push(filters.status);
  }
  if (filters.assignedUserId) {
    query += ` AND assignedUserId = ?`;
    params.push(filters.assignedUserId);
  }

  // Sorting (Default to newest first)
  const validSortColumns = ['dueDate', 'createdAt', 'priority', 'status'];
  const sortBy = validSortColumns.includes(filters.sortBy) ? filters.sortBy : 'createdAt';
  const order = filters.order === 'asc' ? 'ASC' : 'DESC';
  
  query += ` ORDER BY ${sortBy} ${order}`;

  return db.prepare(query).all(...params) as Task[];
};

export const updateTask = (id: string, updates: Partial<Task>, updatedBy: string): Task | undefined => {
  const now = new Date().toISOString();
  const fields = Object.keys(updates).filter(key => key !== 'id' && key !== 'projectId' && key !== 'createdAt');
  
  if (fields.length === 0) return getTaskById(id);

  const setClause = fields.map(field => `${field} = ?`).join(', ');
  const values = fields.map(field => updates[field as keyof Task]);

  const stmt = db.prepare(`
    UPDATE tasks 
    SET ${setClause}, updatedAt = ?, updatedBy = ? 
    WHERE id = ?
  `);

  stmt.run(...values, now, updatedBy, id);
  return getTaskById(id);
};

export const deleteTask = (id: string): boolean => {
  const stmt = db.prepare(`DELETE FROM tasks WHERE id = ?`);
  const result = stmt.run(id);
  return result.changes > 0;
};