import { Response } from 'express';
import { AuthRequest } from '../types/express';
import * as TaskModel from '../models/task.model';
import * as ProjectModel from '../models/project.model';
import db from '../database/db';
import crypto from 'crypto';

// Helper function to log activity
const logActivity = (taskId: string, userId: string, action: string) => {
  const stmt = db.prepare(`INSERT INTO activities (id, taskId, userId, action, createdAt) VALUES (?, ?, ?, ?, ?)`);
  stmt.run(crypto.randomUUID(), taskId, userId, action, new Date().toISOString());
};

export const createTask = (req: AuthRequest, res: Response) => {
  try {
    const { projectId, assignedUserId } = req.body;
    const userId = req.user!.id;

    // 1. Verify project exists and user has access
    const project = ProjectModel.getProjectById(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const isMember = ProjectModel.getProjectMembers(projectId).some(m => m.id === userId);
    if (req.user!.role !== 'ADMIN' && project.ownerId !== userId && !isMember) {
      return res.status(403).json({ error: 'You do not have access to this project' });
    }

    // 2. Create the task
    const task = TaskModel.createTask(req.body, userId);
    
    // 3. Log activity & notify
    logActivity(task.id, userId, 'created a task');
    if (assignedUserId && assignedUserId !== userId) {
      db.prepare(`INSERT INTO notifications (id, userId, message, createdAt) VALUES (?, ?, ?, ?)`)
        .run(crypto.randomUUID(), assignedUserId, `You were assigned to task: ${task.title}`, new Date().toISOString());
    }

    res.status(201).json({ message: 'Task created', task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTasks = (req: AuthRequest, res: Response) => {
  try {
    const projectId = req.params.projectId;
    
    // Authorization check
    const project = ProjectModel.getProjectById(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const isMember = ProjectModel.getProjectMembers(projectId).some(m => m.id === req.user!.id);
    if (req.user!.role !== 'ADMIN' && project.ownerId !== req.user!.id && !isMember) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Pass query params (search, priority, status, etc.) to the model
    const tasks = TaskModel.getTasks(projectId, req.query);
    res.status(200).json({ tasks });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTask = (req: AuthRequest, res: Response) => {
  try {
    const taskId = req.params.id;
    const task = TaskModel.getTaskById(taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const userId = req.user!.id;

    // Authorization check (Only Admin, Project Owner, or Assigned Developer can update)
    const project = ProjectModel.getProjectById(task.projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const isAssigned = task.assignedUserId === userId;
    const isOwner = project.ownerId === userId;
    if (req.user!.role !== 'ADMIN' && !isOwner && !isAssigned) {
      return res.status(403).json({ error: 'You do not have permission to update this task' });
    }

    // Build activity message based on changes
    let activityMessage = 'updated the task';
    if (req.body.status && req.body.status !== task.status) {
      activityMessage = `moved the task to ${req.body.status}`;
    } else if (req.body.priority && req.body.priority !== task.priority) {
      activityMessage = `changed priority to ${req.body.priority}`;
    }

    const updatedTask = TaskModel.updateTask(taskId, req.body, userId);

    // Log activity & notify if assigned user changed
    logActivity(taskId, userId, activityMessage);
    if (req.body.assignedUserId && req.body.assignedUserId !== task.assignedUserId) {
      db.prepare(`INSERT INTO notifications (id, userId, message, createdAt) VALUES (?, ?, ?, ?)`)
        .run(crypto.randomUUID(), req.body.assignedUserId, `You were assigned to task: ${updatedTask?.title}`, new Date().toISOString());
    }

    res.status(200).json({ message: 'Task updated', task: updatedTask });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteTask = (req: AuthRequest, res: Response) => {
  try {
    const taskId = req.params.id;
    const task = TaskModel.getTaskById(taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const project = ProjectModel.getProjectById(task.projectId);
    if (req.user!.role !== 'ADMIN' && project?.ownerId !== req.user!.id) {
      return res.status(403).json({ error: 'Only the project owner or Admin can delete tasks' });
    }

    TaskModel.deleteTask(taskId);
    res.status(200).json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};