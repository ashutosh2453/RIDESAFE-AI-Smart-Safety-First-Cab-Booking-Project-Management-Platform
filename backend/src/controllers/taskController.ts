import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { TaskService } from '../services/taskService';

export class TaskController {
  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { projectId, search, status, priority } = req.query;
      const tasks = await TaskService.listTasks(userId, {
        projectId: projectId as string,
        search: search as string,
        status: status as any,
        priority: priority as any,
      });
      return res.status(200).json({
        success: true,
        data: tasks,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const task = await TaskService.getTaskById(userId, id);
      return res.status(200).json({
        success: true,
        data: task,
      });
    } catch (err) {
      next(err);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const task = await TaskService.createTask(userId, req.body);
      return res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: task,
      });
    } catch (err) {
      next(err);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const task = await TaskService.updateTask(userId, id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Task updated successfully',
        data: task,
      });
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const result = await TaskService.deleteTask(userId, id);
      return res.status(200).json({
        success: true,
        message: 'Task deleted successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}
