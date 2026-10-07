import { prisma } from '../config/db';

export class DashboardService {
  static async getDashboardStats(userId: string) {
    // 1. Projects metrics
    const [totalProjects, inProgressProjects, completedProjects, notStartedProjects] = await Promise.all([
      prisma.project.count({ where: { userId } }),
      prisma.project.count({ where: { userId, status: 'IN_PROGRESS' } }),
      prisma.project.count({ where: { userId, status: 'COMPLETED' } }),
      prisma.project.count({ where: { userId, status: 'NOT_STARTED' } }),
    ]);

    // 2. Tasks metrics
    const [totalTasks, completedTasks, pendingTasks, inProgressTasks] = await Promise.all([
      prisma.task.count({ where: { userId } }),
      prisma.task.count({ where: { userId, status: 'COMPLETED' } }),
      prisma.task.count({ where: { userId, status: 'PENDING' } }),
      prisma.task.count({ where: { userId, status: 'IN_PROGRESS' } }),
    ]);

    // 3. Rides metrics
    const [totalRides, completedRides, cancelledRides, activeRides] = await Promise.all([
      prisma.ride.count({ where: { userId } }),
      prisma.ride.count({ where: { userId, status: 'COMPLETED' } }),
      prisma.ride.count({ where: { userId, status: 'CANCELLED' } }),
      prisma.ride.count({
        where: {
          userId,
          status: {
            in: ['REQUESTED', 'DRIVER_ASSIGNED', 'DRIVER_ARRIVING', 'DRIVER_ARRIVED', 'STARTED'],
          },
        },
      }),
    ]);

    // 4. Safety events count
    const safetyEvents = await prisma.safetyEvent.count({
      where: { userId },
    });

    // 5. User ratings average
    const ratingsAggregate = await prisma.rideRating.aggregate({
      where: { userId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const averageDriverRating = ratingsAggregate._avg.rating
      ? parseFloat(ratingsAggregate._avg.rating.toFixed(1))
      : 5.0;

    // 6. Recent Projects
    const recentProjects = await prisma.project.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 4,
      include: {
        _count: { select: { tasks: true } },
        tasks: { select: { status: true } },
      },
    });

    const formattedRecentProjects = recentProjects.map((p) => {
      const total = p._count.tasks;
      const completed = p.tasks.filter((t) => t.status === 'COMPLETED').length;
      return {
        id: p.id,
        name: p.name,
        description: p.description,
        status: p.status,
        totalTasks: total,
        completedTasks: completed,
        progressPercent: total > 0 ? Math.round((completed / total) * 100) : 0,
        updatedAt: p.updatedAt,
      };
    });

    // 7. Recent Rides
    const recentRides = await prisma.ride.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 4,
      include: {
        driver: {
          select: {
            name: true,
            rating: true,
            photoUrl: true,
            vehicle: true,
          },
        },
        ratings: {
          select: {
            rating: true,
            review: true,
          },
        },
      },
    });

    // 8. Upcoming Tasks
    const upcomingTasks = await prisma.task.findMany({
      where: {
        userId,
        status: { in: ['PENDING', 'IN_PROGRESS'] },
      },
      orderBy: [{ dueDate: 'asc' }, { priority: 'desc' }],
      take: 5,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      overview: {
        totalProjects,
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        projectsInProgress: inProgressProjects,
        projectsCompleted: completedProjects,
        projectsNotStarted: notStartedProjects,
        totalRides,
        completedRides,
        activeRides,
        cancelledRides,
        averageDriverRating,
        safetyEvents,
      },
      recentProjects: formattedRecentProjects,
      recentRides,
      upcomingTasks,
    };
  }
}
