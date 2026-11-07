import db from '../database/db';
import crypto from 'crypto';

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
  userName?: string; // Joined from users table
}

export interface Activity {
  id: string;
  action: string;
  createdAt: string;
  userName: string;
}

export const addComment = (taskId: string, userId: string, content: string): Comment => {
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO comments (id, taskId, userId, content, createdAt)
    VALUES (?, ?, ?, ?, ?)
  `);
  stmt.run(id, taskId, userId, content, createdAt);

  return { id, taskId, userId, content, createdAt };
};

export const getComments = (taskId: string): Comment[] => {
  const stmt = db.prepare(`
    SELECT c.*, u.name as userName 
    FROM comments c
    JOIN users u ON c.userId = u.id
    WHERE c.taskId = ?
    ORDER BY c.createdAt ASC
  `);
  return stmt.all(taskId) as Comment[];
};

export const getActivityLog = (taskId: string): Activity[] => {
  const stmt = db.prepare(`
    SELECT a.id, a.action, a.createdAt, u.name as userName
    FROM activities a
    JOIN users u ON a.userId = u.id
    WHERE a.taskId = ?
    ORDER BY a.createdAt DESC
  `);
  return stmt.all(taskId) as Activity[];
};

export const getNotifications = (userId: string) => {
  const stmt = db.prepare(`
    SELECT * FROM notifications 
    WHERE userId = ? 
    ORDER BY createdAt DESC 
    LIMIT 20
  `);
  return stmt.all(userId);
};

export const markNotificationRead = (notificationId: string, userId: string) => {
  const stmt = db.prepare(`UPDATE notifications SET isRead = 1 WHERE id = ? AND userId = ?`);
  return stmt.run(notificationId, userId);
};