import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  Check,
  Clock,
  FolderKanban,
  AlertCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { Task, Project, TaskPriority, TaskStatus } from '../types';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';

export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [projectFilter, setProjectFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [projectId, setProjectId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [status, setStatus] = useState<TaskStatus>('PENDING');
  const [dueDate, setDueDate] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchTasksAndProjects = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (priorityFilter !== 'ALL') params.priority = priorityFilter;
      if (projectFilter !== 'ALL') params.projectId = projectFilter;

      const [tasksRes, projectsRes] = await Promise.all([
        api.get('/tasks', { params }),
        api.get('/projects'),
      ]);

      if (tasksRes.data.success) setTasks(tasksRes.data.data);
      if (projectsRes.data.success) setProjects(projectsRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasksAndProjects();
  }, [statusFilter, priorityFilter, projectFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTasksAndProjects();
  };

  const handleOpenAdd = () => {
    setEditingTask(null);
    setProjectId(projects.length > 0 ? projects[0].id : '');
    setName('');
    setDescription('');
    setPriority('MEDIUM');
    setStatus('PENDING');
    setDueDate('');
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: Task) => {
    setEditingTask(t);
    setProjectId(t.projectId);
    setName(t.name);
    setDescription(t.description || '');
    setPriority(t.priority);
    setStatus(t.status);
    setDueDate(t.dueDate ? t.dueDate.split('T')[0] : '');
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Task name is required.');
      return;
    }
    if (!editingTask && !projectId) {
      setErrorMessage('Please select a project for this task.');
      return;
    }

    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}`, {
          name,
          description,
          priority,
          status,
          dueDate: dueDate || null,
        });
      } else {
        await api.post('/tasks', {
          projectId,
          name,
          description,
          priority,
          status,
          dueDate: dueDate || null,
        });
      }
      setIsModalOpen(false);
      fetchTasksAndProjects();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to save task.');
    }
  };

  const handleToggleStatus = async (task: Task) => {
    const nextStatus: TaskStatus =
      task.status === 'PENDING'
        ? 'IN_PROGRESS'
        : task.status === 'IN_PROGRESS'
        ? 'COMPLETED'
        : 'PENDING';

    try {
      await api.put(`/tasks/${task.id}`, { status: nextStatus });
      fetchTasksAndProjects();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchTasksAndProjects();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fadeIn">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <span className="text-xs font-black tracking-widest uppercase text-amber-400">
            CHECKLIST MANAGEMENT CONSOLE
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
            Trip Tasks
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track, filter, and complete operational checklist tasks across all your transportation projects
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          disabled={projects.length === 0}
          className="flex items-center gap-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold px-4 py-2 text-xs shadow-lg shadow-cyan-400/20 transition disabled:opacity-40 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Task</span>
        </button>
      </div>

      {projects.length === 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-300">
          Notice: You need at least one trip project before creating tasks. Create a project first!
        </div>
      )}

      {/* Search and Multiple Filters */}
      <div className="space-y-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks by title..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900/80 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition"
          />
          <Search className="h-4 w-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </form>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="h-3.5 w-3.5" />
            <span>Filters:</span>
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>

          {/* Project filter */}
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Task List */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-400">
          <CheckSquare className="h-10 w-10 mx-auto text-slate-600 mb-2" />
          <p className="text-sm font-bold text-white">No tasks found</p>
          <p className="text-xs text-slate-500 mt-1">Try resetting your filter parameters or add a new task.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const isCompleted = task.status === 'COMPLETED';

            return (
              <div
                key={task.id}
                className={`rounded-2xl border p-4 transition flex items-center justify-between gap-4 shadow-md ${
                  isCompleted
                    ? 'border-emerald-500/20 bg-slate-950/40 opacity-80'
                    : 'border-slate-800 bg-slate-900/70 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3 flex-1">
                  {/* Status Toggle Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(task)}
                    className={`h-6 w-6 mt-0.5 rounded-full border flex items-center justify-center shrink-0 transition ${
                      isCompleted
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                        : task.status === 'IN_PROGRESS'
                        ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400 animate-pulse'
                        : 'border-slate-700 hover:border-cyan-400'
                    }`}
                    title="Click to toggle status"
                  >
                    {isCompleted && <Check className="h-3.5 w-3.5" />}
                    {task.status === 'IN_PROGRESS' && <Clock className="h-3 w-3" />}
                  </button>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-sm font-bold ${
                          isCompleted ? 'line-through text-slate-500' : 'text-white'
                        }`}
                      >
                        {task.name}
                      </span>
                      <Badge priority={task.priority} size="sm" />
                      <Badge status={task.status} size="sm" />
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 text-cyan-400 font-semibold">
                        <FolderKanban className="h-3 w-3" />
                        <span>{task.project?.name || 'Project'}</span>
                      </span>
                      {task.dueDate && (
                        <span className="flex items-center gap-1 text-slate-500">
                          <Clock className="h-3 w-3" />
                          <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleOpenEdit(task)}
                    className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                    title="Edit"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:bg-rose-950 hover:text-rose-400 transition"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD / EDIT TASK MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? 'Edit Task' : 'Create Task'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {errorMessage && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {!editingTask && (
            <div>
              <label className="block text-slate-300 uppercase font-semibold mb-1">
                Parent Project
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:outline-none focus:border-cyan-500"
                required
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-slate-300 uppercase font-semibold mb-1">Task Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Book Cab"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 uppercase font-semibold mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Schedule ride for SRM to Airport Terminal 2"
              rows={2}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 uppercase font-semibold mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 uppercase font-semibold mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 uppercase font-semibold mb-1">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:outline-none focus:border-cyan-500"
            />
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
              {editingTask ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
