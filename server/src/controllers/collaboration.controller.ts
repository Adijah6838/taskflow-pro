import { Response } from 'express';
import { AuthRequest } from '../types/express';
import * as CollabModel from '../models/collaboration.model';
import * as TaskModel from '../models/task.model';
import * as ProjectModel from '../models/project.model';

const checkAccess = (userId: string, role: string, taskId: string) => {
  const task = TaskModel.getTaskById(taskId);
  if (!task) return { valid: false, status: 404, error: 'Task not found' };

  const project = ProjectModel.getProjectById(task.projectId);
  if (!project) return { valid: false, status: 404, error: 'Project not found' };

  const members = ProjectModel.getProjectMembers(task.projectId);
  const isMember = members.some((m: any) => m.id === userId);

  if (role !== 'ADMIN' && project.ownerId !== userId && !isMember) {
    return { valid: false, status: 403, error: 'Access denied' };
  }

  return { valid: true, status: 200, error: null };
};

export const addComment = (req: AuthRequest, res: Response) => {
  try {
    const taskId = req.params.taskId;
    const access = checkAccess(req.user!.id, req.user!.role, taskId);
    if (!access.valid) return res.status(access.status).json({ error: access.error });

    const comment = CollabModel.addComment(taskId, req.user!.id, req.body.content);
    res.status(201).json({ message: 'Comment added', comment });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getComments = (req: AuthRequest, res: Response) => {
  try {
    const taskId = req.params.taskId;
    const access = checkAccess(req.user!.id, req.user!.role, taskId);
    if (!access.valid) return res.status(access.status).json({ error: access.error });

    const comments = CollabModel.getComments(taskId);
    res.status(200).json({ comments });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getActivities = (req: AuthRequest, res: Response) => {
  try {
    const taskId = req.params.taskId;
    const access = checkAccess(req.user!.id, req.user!.role, taskId);
    if (!access.valid) return res.status(access.status).json({ error: access.error });

    const activities = CollabModel.getActivityLog(taskId);
    res.status(200).json({ activities });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMyNotifications = (req: AuthRequest, res: Response) => {
  try {
    const notifications = CollabModel.getNotifications(req.user!.id);
    res.status(200).json({ notifications });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const readNotification = (req: AuthRequest, res: Response) => {
  try {
    CollabModel.markNotificationRead(req.params.id, req.user!.id);
    res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};