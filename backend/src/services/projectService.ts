import { ProjectStatus, Prisma } from '@prisma/client';
import { prisma } from '../config/db';

export class ProjectService {
  static async listProjects(userId: string, query: { search?: string; status?: ProjectStatus }) {
    const where: Prisma.ProjectWhereInput = {
      userId,
    };

    if (query.search) {
      where.name = {
        contains: query.search.trim(),
        mode: 'insensitive',
      };
    }

    if (query.status) {
      where.status = query.status;
    }

    const projects = await prisma.project.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { tasks: true },
        },
        tasks: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    // Compute completion progress for each project
    return projects.map((project) => {
      const totalTasks = project._count.tasks;
      const completedTasks = project.tasks.filter((t) => t.status === 'COMPLETED').length;
      const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      const { tasks, ...rest } = project;
      return {
        ...rest,
        totalTasks,
        completedTasks,
        progressPercent,
      };
    });
  }

  static async getProjectById(userId: string, projectId: string) {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId,
      },
      include: {
        tasks: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!project) {
      const error: any = new Error('Project not found or unauthorized.');
      error.statusCode = 404;
      error.code = 'PROJECT_NOT_FOUND';
      throw error;
    }

    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter((t) => t.status === 'COMPLETED').length;
    const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      ...project,
      totalTasks,
      completedTasks,
      progressPercent,
    };
  }

  static async createProject(
    userId: string,
    data: { name: string; description?: string | null; status?: ProjectStatus; startDate?: string | null; endDate?: string | null }
  ) {
    return prisma.project.create({
      data: {
        userId,
        name: data.name.trim(),
        description: data.description?.trim() || null,
        status: data.status || ProjectStatus.NOT_STARTED,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });
  }

  static async updateProject(
    userId: string,
    projectId: string,
    data: { name?: string; description?: string | null; status?: ProjectStatus; startDate?: string | null; endDate?: string | null }
  ) {
    const existing = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!existing) {
      const error: any = new Error('Project not found or unauthorized.');
      error.statusCode = 404;
      error.code = 'PROJECT_NOT_FOUND';
      throw error;
    }

    return prisma.project.update({
      where: { id: projectId },
      data: {
        name: data.name !== undefined ? data.name.trim() : undefined,
        description: data.description !== undefined ? data.description?.trim() || null : undefined,
        status: data.status !== undefined ? data.status : undefined,
        startDate: data.startDate !== undefined ? (data.startDate ? new Date(data.startDate) : null) : undefined,
        endDate: data.endDate !== undefined ? (data.endDate ? new Date(data.endDate) : null) : undefined,
      },
    });
  }

  static async deleteProject(userId: string, projectId: string) {
    const existing = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!existing) {
      const error: any = new Error('Project not found or unauthorized.');
      error.statusCode = 404;
      error.code = 'PROJECT_NOT_FOUND';
      throw error;
    }

    await prisma.project.delete({
      where: { id: projectId },
    });

    return { id: projectId, deleted: true };
  }
}
