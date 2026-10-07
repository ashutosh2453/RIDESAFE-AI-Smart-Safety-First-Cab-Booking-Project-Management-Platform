import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  CheckSquare,
  CheckCircle2,
  Clock,
  Car,
  ShieldAlert,
  ArrowRight,
  Plus,
  Star,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { api } from '../services/api';
import { DashboardData } from '../types';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/StatCard';
import { Badge } from '../components/Badge';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get('/dashboard');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'GOOD MORNING';
    if (hour < 18) return 'GOOD AFTERNOON';
    return 'GOOD EVENING';
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
          <p className="text-sm text-cyan-400 font-medium">Aggregating PostgreSQL telemetry...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center">
        <p className="text-red-400 text-sm font-semibold">{error || 'Unable to load dashboard'}</p>
        <button
          onClick={fetchDashboard}
          className="mt-4 rounded-xl bg-red-500 text-white px-4 py-2 text-xs font-bold"
        >
          Retry
        </button>
      </div>
    );
  }

  const { overview, recentProjects, recentRides, upcomingTasks } = data;

  // Chart data
  const taskChartData = [
    { name: 'Completed', count: overview.completedTasks, color: '#10B981' },
    { name: 'In Progress', count: overview.inProgressTasks, color: '#00D2FF' },
    { name: 'Pending', count: overview.pendingTasks, color: '#F59E0B' },
  ];

  const rideChartData = [
    { name: 'Completed', value: overview.completedRides, color: '#10B981' },
    { name: 'Active', value: overview.activeRides, color: '#00D2FF' },
    { name: 'Cancelled', value: overview.cancelledRides, color: '#EF4444' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs font-black tracking-widest uppercase text-cyan-400">
            {getGreeting()}, {user?.name?.toUpperCase() || 'TRAVELER'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
            Your RideSafe Overview
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Unified live snapshot of transportation trips, passenger safety events, and project tasks
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboard}
            className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 transition"
            title="Refresh dashboard"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </button>
          <Link
            to="/book-ride"
            className="flex items-center gap-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold px-4 py-2 text-xs shadow-lg shadow-cyan-400/20 transition"
          >
            <Car className="h-4 w-4" />
            <span>Book Ride</span>
          </Link>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="PROJECTS"
          value={overview.totalProjects}
          subtitle={`${overview.projectsInProgress} in progress`}
          icon={FolderKanban}
          variant="indigo"
        />
        <StatCard
          title="TASKS"
          value={overview.totalTasks}
          subtitle="Checklist total"
          icon={CheckSquare}
          variant="default"
        />
        <StatCard
          title="COMPLETED"
          value={overview.completedTasks}
          subtitle="Tasks finished"
          icon={CheckCircle2}
          variant="emerald"
        />
        <StatCard
          title="PENDING"
          value={overview.pendingTasks}
          subtitle="Awaiting action"
          icon={Clock}
          variant="amber"
        />
        <StatCard
          title="ACTIVE RIDES"
          value={overview.activeRides}
          subtitle={`${overview.totalRides} all-time rides`}
          icon={Car}
          variant="cyan"
        />
        <StatCard
          title="SAFETY EVENTS"
          value={overview.safetyEvents}
          subtitle={`${overview.averageDriverRating} ★ avg rating`}
          icon={ShieldAlert}
          variant="rose"
        />
      </div>

      {/* Visual Analytics / Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Progress Distribution */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Project Task Breakdown
            </h3>
            <span className="text-xs text-slate-400">Total: {overview.totalTasks}</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B132B', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {taskChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ride Status Distribution */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Transportation Telemetry
            </h3>
            <span className="text-xs text-slate-400">Total: {overview.totalRides}</span>
          </div>
          <div className="h-56 w-full flex items-center justify-center">
            {overview.totalRides === 0 ? (
              <div className="text-center text-xs text-slate-500">
                <Car className="h-8 w-8 mx-auto mb-2 text-slate-600" />
                No rides recorded yet. Book a ride to populate metrics!
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={rideChartData.filter((d) => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={6}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {rideChartData.map((entry, index) => (
                      <Cell key={`cell-pie-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0B132B', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Three Columns: Recent Rides, Recent Projects, Upcoming Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Rides */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Car className="h-4 w-4 text-cyan-400" />
                <span>Recent Rides</span>
              </h3>
              <Link to="/ride-history" className="text-xs text-cyan-400 hover:underline">
                View all
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {recentRides.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">No recent rides booked.</p>
              ) : (
                recentRides.map((ride) => (
                  <Link
                    key={ride.id}
                    to={ride.status === 'COMPLETED' ? `/ride-history` : `/active-ride/${ride.id}`}
                    className="block rounded-xl border border-slate-800/80 bg-slate-950/40 p-3 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate max-w-[150px]">
                        {ride.destination}
                      </span>
                      <Badge status={ride.status} size="sm" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 truncate">
                      From: {ride.pickup}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{ride.driver?.name || 'Assigned driver'}</span>
                      <span className="font-bold text-cyan-400">₹{ride.fareEstimate}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          <Link
            to="/book-ride"
            className="mt-4 w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-700 py-2.5 text-xs font-bold text-slate-300 hover:border-cyan-500 hover:text-cyan-400 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Book New Ride</span>
          </Link>
        </div>

        {/* Recent Projects */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-indigo-400" />
                <span>Recent Projects</span>
              </h3>
              <Link to="/projects" className="text-xs text-cyan-400 hover:underline">
                View all
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {recentProjects.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">No projects created yet.</p>
              ) : (
                recentProjects.map((proj) => (
                  <Link
                    key={proj.id}
                    to={`/projects/${proj.id}`}
                    className="block rounded-xl border border-slate-800/80 bg-slate-950/40 p-3 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate max-w-[160px]">
                        {proj.name}
                      </span>
                      <Badge status={proj.status} size="sm" />
                    </div>
                    {/* Progress Bar */}
                    <div className="mt-2.5 space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                        <span>{proj.completedTasks} / {proj.totalTasks} Tasks</span>
                        <span>{proj.progressPercent}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
                          style={{ width: `${proj.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          <Link
            to="/projects"
            className="mt-4 w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-700 py-2.5 text-xs font-bold text-slate-300 hover:border-cyan-500 hover:text-cyan-400 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Trip Project</span>
          </Link>
        </div>

        {/* Upcoming Tasks */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-amber-400" />
                <span>Upcoming Tasks</span>
              </h3>
              <Link to="/tasks" className="text-xs text-cyan-400 hover:underline">
                View all
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {upcomingTasks.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">All tasks completed!</p>
              ) : (
                upcomingTasks.map((t) => (
                  <div
                    key={t.id}
                    className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-slate-200 leading-tight">
                        {t.name}
                      </span>
                      <Badge priority={t.priority} size="sm" />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="truncate max-w-[140px] text-cyan-400/90 font-medium">
                        {t.project?.name}
                      </span>
                      <Badge status={t.status} size="sm" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <Link
            to="/tasks"
            className="mt-4 w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-700 py-2.5 text-xs font-bold text-slate-300 hover:border-cyan-500 hover:text-cyan-400 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Checklist Task</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
