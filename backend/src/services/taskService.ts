import { TaskPriority, TaskStatus, Prisma } from '@prisma/client';
import { prisma } from '../config/db';

export class TaskService {
  static async listTasks(
    userId: string,
    query: {
      projectId?: string;
      search?: string;
      status?: TaskStatus;
      priority?: TaskPriority;
    }
  ) {
    const where: Prisma.TaskWhereInput = {
      userId,
    };

    if (query.projectId) {
      where.projectId = query.projectId;
    }

    if (query.search) {
      where.name = {
        contains: query.search.trim(),
        mode: 'insensitive',
      };
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.priority) {
      where.priority = query.priority;
    }

    return prisma.task.findMany({
      where,
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });
  }

  static async getTaskById(userId: string, taskId: string) {
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });

    if (!task) {
      const error: any = new Error('Task not found or unauthorized.');
      error.statusCode = 404;
      error.code = 'TASK_NOT_FOUND';
      throw error;
    }

    return task;
  }

  static async createTask(
    userId: string,
    data: {
      projectId: string;
      name: string;
      description?: string | null;
      priority?: TaskPriority;
      status?: TaskStatus;
      dueDate?: string | null;
    }
  ) {
    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: { id: data.projectId, userId },
    });

    if (!project) {
      const error: any = new Error('Target project not found or does not belong to you.');
      error.statusCode = 404;
      error.code = 'PROJECT_NOT_FOUND';
      throw error;
    }

    return prisma.task.create({
      data: {
        userId,
        projectId: data.projectId,
        name: data.name.trim(),
        description: data.description?.trim() || null,
        priority: data.priority || TaskPriority.MEDIUM,
        status: data.status || TaskStatus.PENDING,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });
  }

  static async updateTask(
    userId: string,
    taskId: string,
    data: {
      name?: string;
      description?: string | null;
      priority?: TaskPriority;
      status?: TaskStatus;
      dueDate?: string | null;
    }
  ) {
    const existing = await prisma.task.findFirst({
      where: { id: taskId, userId },
    });

    if (!existing) {
      const error: any = new Error('Task not found or unauthorized.');
      error.statusCode = 404;
      error.code = 'TASK_NOT_FOUND';
      throw error;
    }

    return prisma.task.update({
      where: { id: taskId },
      data: {
        name: data.name !== undefined ? data.name.trim() : undefined,
        description: data.description !== undefined ? data.description?.trim() || null : undefined,
        priority: data.priority !== undefined ? data.priority : undefined,
        status: data.status !== undefined ? data.status : undefined,
        dueDate: data.dueDate !== undefined ? (data.dueDate ? new Date(data.dueDate) : null) : undefined,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });
  }

  static async deleteTask(userId: string, taskId: string) {
    const existing = await prisma.task.findFirst({
      where: { id: taskId, userId },
    });

    if (!existing) {
      const error: any = new Error('Task not found or unauthorized.');
      error.statusCode = 404;
      error.code = 'TASK_NOT_FOUND';
      throw error;
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    return { id: taskId, deleted: true };
  }
}
