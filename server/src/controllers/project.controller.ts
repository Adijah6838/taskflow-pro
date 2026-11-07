import { Response } from 'express';
import { AuthRequest } from '../types/express';
import * as ProjectModel from '../models/project.model';

export const createProject = (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id; 
    const project = ProjectModel.createProject(req.body, userId);
    res.status(201).json({ message: 'Project created successfully', project });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProjects = (req: AuthRequest, res: Response) => {
  try {
    const projects = ProjectModel.getProjectsForUser(req.user!.id, req.user!.role);
    res.status(200).json({ projects });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProjectById = (req: AuthRequest, res: Response) => {
  try {
    const project = ProjectModel.getProjectById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const isMember = ProjectModel.getProjectMembers(project.id).some(m => m.id === req.user!.id);
    if (req.user!.role !== 'ADMIN' && project.ownerId !== req.user!.id && !isMember) {
      return res.status(403).json({ error: 'Access denied to this project' });
    }

    res.status(200).json({ project });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProject = (req: AuthRequest, res: Response) => {
  try {
    const project = ProjectModel.getProjectById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    if (req.user!.role !== 'ADMIN' && project.ownerId !== req.user!.id) {
      return res.status(403).json({ error: 'Only the project owner or an Admin can update this project' });
    }

    const updatedProject = ProjectModel.updateProject(req.params.id, req.body);
    res.status(200).json({ message: 'Project updated', project: updatedProject });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteProject = (req: AuthRequest, res: Response) => {
  try {
    const project = ProjectModel.getProjectById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    if (req.user!.role !== 'ADMIN' && project.ownerId !== req.user!.id) {
      return res.status(403).json({ error: 'Only the project owner or an Admin can delete this project' });
    }

    ProjectModel.deleteProject(req.params.id);
    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addMember = (req: AuthRequest, res: Response) => {
  try {
    const project = ProjectModel.getProjectById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    if (req.user!.role !== 'ADMIN' && project.ownerId !== req.user!.id) {
      return res.status(403).json({ error: 'Only the owner can add members' });
    }

    ProjectModel.addProjectMember(req.params.id, req.body.userId);
    const members = ProjectModel.getProjectMembers(req.params.id);
    res.status(200).json({ message: 'Member added', members });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const removeMember = (req: AuthRequest, res: Response) => {
  try {
    const project = ProjectModel.getProjectById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    if (req.user!.role !== 'ADMIN' && project.ownerId !== req.user!.id) {
      return res.status(403).json({ error: 'Only the owner can remove members' });
    }

    ProjectModel.removeProjectMember(req.params.id, req.params.userId);
    res.status(200).json({ message: 'Member removed' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMembers = (req: AuthRequest, res: Response) => {
  try {
    const members = ProjectModel.getProjectMembers(req.params.id);
    res.status(200).json({ members });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};