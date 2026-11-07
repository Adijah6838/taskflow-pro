import db from '../database/db';
import crypto from 'crypto';
export interface ProjectMember {
  id: string;
  name: string;
  email: string;
  role: string;
}
export interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  startDate: string;
  deadline: string;
  status: 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export const createProject = (data: Partial<Project>, ownerId: string): Project => {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  
  const stmt = db.prepare(`
    INSERT INTO projects (id, name, description, ownerId, startDate, deadline, status, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    id, 
    data.name, 
    data.description || null, 
    ownerId, 
    data.startDate || null, 
    data.deadline || null, 
    data.status || 'PLANNING', 
    now, 
    now
  );

  // Automatically add the owner as a member of the project
  db.prepare(`INSERT INTO project_members (projectId, userId, addedAt) VALUES (?, ?, ?)`)
    .run(id, ownerId, now);

  return getProjectById(id) as Project;
};

export const getProjectById = (id: string): Project | undefined => {
  const stmt = db.prepare(`SELECT * FROM projects WHERE id = ?`);
  return stmt.get(id) as Project | undefined;
};

// Get projects based on role (Admin sees all, others see projects they own or are members of)
export const getProjectsForUser = (userId: string, role: string): Project[] => {
  if (role === 'ADMIN') {
    return db.prepare(`SELECT * FROM projects ORDER BY createdAt DESC`).all() as Project[];
  }
  
  const stmt = db.prepare(`
    SELECT DISTINCT p.* FROM projects p
    LEFT JOIN project_members pm ON p.id = pm.projectId
    WHERE p.ownerId = ? OR pm.userId = ?
    ORDER BY p.createdAt DESC
  `);
  return stmt.all(userId, userId) as Project[];
};

export const updateProject = (id: string, updates: Partial<Project>): Project | undefined => {
  const now = new Date().toISOString();
  
  // Build dynamic query based on what fields are provided
  const fields = Object.keys(updates).filter(key => key !== 'id' && key !== 'ownerId' && key !== 'createdAt');
  if (fields.length === 0) return getProjectById(id);

  const setClause = fields.map(field => `${field} = ?`).join(', ');
  const values = fields.map(field => updates[field as keyof Project]);

  const stmt = db.prepare(`
    UPDATE projects 
    SET ${setClause}, updatedAt = ? 
    WHERE id = ?
  `);
  
  stmt.run(...values, now, id);
  return getProjectById(id);
};

export const deleteProject = (id: string): boolean => {
  const stmt = db.prepare(`DELETE FROM projects WHERE id = ?`);
  const result = stmt.run(id);
  return result.changes > 0;
};

// Project Members Management
export const addProjectMember = (projectId: string, userId: string) => {
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO project_members (projectId, userId, addedAt) 
    VALUES (?, ?, ?)
  `);
  stmt.run(projectId, userId, now);
};

export const removeProjectMember = (projectId: string, userId: string) => {
  const stmt = db.prepare(`DELETE FROM project_members WHERE projectId = ? AND userId = ?`);
  stmt.run(projectId, userId);
};

export const getProjectMembers = (projectId: string): ProjectMember[] => {
  const stmt = db.prepare(`
    SELECT u.id, u.name, u.email, u.role 
    FROM users u
    INNER JOIN project_members pm ON u.id = pm.userId
    WHERE pm.projectId = ?
  `);
  return stmt.all(projectId) as ProjectMember[];
};