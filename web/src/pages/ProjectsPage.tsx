import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  Calendar,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { Project, ProjectStatus } from '../types';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('IN_PROGRESS');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'ALL') params.status = statusFilter;

      const res = await api.get('/projects', { params });
      if (res.data.success) {
        setProjects(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProjects();
  };

  const handleOpenCreate = () => {
    setEditingProject(null);
    setName('');
    setDescription('');
    setStatus('IN_PROGRESS');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate('');
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Project) => {
    setEditingProject(p);
    setName(p.name);
    setDescription(p.description || '');
    setStatus(p.status);
    setStartDate(p.startDate ? p.startDate.split('T')[0] : '');
    setEndDate(p.endDate ? p.endDate.split('T')[0] : '');
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Project name is required.');
      return;
    }

    try {
      if (editingProject) {
        await api.put(`/projects/${editingProject.id}`, {
          name,
          description,
          status,
          startDate: startDate || null,
          endDate: endDate || null,
        });
      } else {
        await api.post('/projects', {
          name,
          description,
          status,
          startDate: startDate || null,
          endDate: endDate || null,
        });
      }
      setIsModalOpen(false);
      fetchProjects();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to save project.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this project and all its associated checklist tasks?')) return;
    try {
      await api.delete(`/projects/${id}`);
      fetchProjects();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fadeIn">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <span className="text-xs font-black tracking-widest uppercase text-indigo-400">
            TRIP COORDINATION & PLANNING
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
            Trip Projects
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Organize transportation goals, cab booking phases, and checklist execution workflows
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold px-4 py-2 text-xs shadow-lg shadow-cyan-400/20 transition self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Trip Project</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by title..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900/80 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition"
          />
          <Search className="h-4 w-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="NOT_STARTED">Not Started</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {/* Project Cards List */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-400">
          <FolderKanban className="h-10 w-10 mx-auto text-slate-600 mb-2" />
          <p className="text-sm font-bold text-white">No projects found</p>
          <p className="text-xs text-slate-500 mt-1">Create a trip project like "Chennai Airport Trip" to begin tracking.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 hover:border-slate-700 transition flex flex-col justify-between space-y-4 shadow-xl"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-bold text-white leading-snug">{p.name}</h3>
                  <Badge status={p.status} size="sm" />
                </div>

                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {p.description || 'No description provided.'}
                </p>

                {/* Progress bar */}
                <div className="mt-5 space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-300 font-semibold">
                    <span>
                      {p.completedTasks || 0} of {p.totalTasks || 0} Tasks Completed
                    </span>
                    <span className="text-cyan-400">{p.progressPercent || 0}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${p.progressPercent || 0}%` }}
                    />
                  </div>
                </div>

                {/* Dates */}
                {(p.startDate || p.endDate) && (
                  <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-400">
                    <Calendar className="h-3.5 w-3.5 text-slate-500" />
                    <span>
                      {p.startDate ? new Date(p.startDate).toLocaleDateString() : 'N/A'} —{' '}
                      {p.endDate ? new Date(p.endDate).toLocaleDateString() : 'Ongoing'}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <Link
                  to={`/projects/${p.id}`}
                  className="flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition"
                >
                  <span>View Details & Tasks</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                    title="Edit"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:bg-rose-950 hover:text-rose-400 transition"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT PROJECT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? 'Edit Trip Project' : 'Create Trip Project'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {errorMessage && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-slate-300 uppercase font-semibold mb-1">
              Project Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Chennai Airport Trip"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 uppercase font-semibold mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Comprehensive itinerary coordination for morning flight departures"
              rows={3}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 uppercase font-semibold mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="NOT_STARTED">Not Started</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 uppercase font-semibold mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 uppercase font-semibold mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-extrabold px-5 py-2 shadow-lg shadow-cyan-400/20"
            >
              {editingProject ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
