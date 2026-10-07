import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { ProjectService } from '../services/projectService';

export class ProjectController {
  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { search, status } = req.query;
      const projects = await ProjectService.listProjects(userId, {
        search: search as string,
        status: status as any,
      });
      return res.status(200).json({
        success: true,
        data: projects,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const project = await ProjectService.getProjectById(userId, id);
      return res.status(200).json({
        success: true,
        data: project,
      });
    } catch (err) {
      next(err);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const project = await ProjectService.createProject(userId, req.body);
      return res.status(201).json({
        success: true,
        message: 'Project created successfully',
        data: project,
      });
    } catch (err) {
      next(err);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const project = await ProjectService.updateProject(userId, id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Project updated successfully',
        data: project,
      });
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const result = await ProjectService.deleteProject(userId, id);
      return res.status(200).json({
        success: true,
        message: 'Project deleted successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}
