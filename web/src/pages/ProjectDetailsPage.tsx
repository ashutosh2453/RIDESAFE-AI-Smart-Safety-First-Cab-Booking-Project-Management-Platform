import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FolderKanban,
  CheckSquare,
  Plus,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  Check,
  AlertCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { Project, Task, TaskPriority, TaskStatus } from '../types';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';

export const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Task modal state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskName, setTaskName] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [status, setStatus] = useState<TaskStatus>('PENDING');
  const [dueDate, setDueDate] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchProjectDetails = async () => {
    if (!id) return;
    try {
      const res = await api.get(`/projects/${id}`);
      if (res.data.success) {
        setProject(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const handleOpenAddTask = () => {
    setEditingTask(null);
    setTaskName('');
    setTaskDesc('');
    setPriority('MEDIUM');
    setStatus('PENDING');
    setDueDate('');
    setErrorMessage(null);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditTask = (t: Task) => {
    setEditingTask(t);
    setTaskName(t.name);
    setTaskDesc(t.description || '');
    setPriority(t.priority);
    setStatus(t.status);
    setDueDate(t.dueDate ? t.dueDate.split('T')[0] : '');
    setErrorMessage(null);
    setIsTaskModalOpen(true);
  };

  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim() || !id) {
      setErrorMessage('Task name is required.');
      return;
    }

    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}`, {
          name: taskName,
          description: taskDesc,
          priority,
          status,
          dueDate: dueDate || null,
        });
      } else {
        await api.post('/tasks', {
          projectId: id,
          name: taskName,
          description: taskDesc,
          priority,
          status,
          dueDate: dueDate || null,
        });
      }
      setIsTaskModalOpen(false);
      fetchProjectDetails();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to save task.');
    }
  };

  const handleToggleTaskStatus = async (task: Task) => {
    const nextStatus: TaskStatus =
      task.status === 'PENDING'
        ? 'IN_PROGRESS'
        : task.status === 'IN_PROGRESS'
        ? 'COMPLETED'
        : 'PENDING';

    try {
      await api.put(`/tasks/${task.id}`, { status: nextStatus });
      fetchProjectDetails();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchProjectDetails();
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center text-slate-300">
        <p className="font-bold">Project not found.</p>
        <Link to="/projects" className="text-xs text-cyan-400 mt-2 inline-block">
          Return to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fadeIn">
      {/* Header */}
      <div>
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Projects</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-widest uppercase text-indigo-400">
                TRIP PROJECT DOSSIER
              </span>
              <Badge status={project.status} size="sm" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
              {project.name}
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              {project.description || 'No description provided.'}
            </p>
          </div>

          <button
            onClick={handleOpenAddTask}
            className="flex items-center gap-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold px-4 py-2 text-xs shadow-lg shadow-cyan-400/20 transition self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Add Checklist Task</span>
          </button>
        </div>
      </div>

      {/* Progress & Metadata Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Execution Progress</span>
            <div className="text-2xl font-black text-white mt-0.5">
              {project.completedTasks} / {project.totalTasks} Tasks Completed (
              <span className="text-cyan-400">{project.progressPercent}%</span>)
            </div>
          </div>

          {(project.startDate || project.endDate) && (
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-500" />
              <span>
                {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'} —{' '}
                {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Ongoing'}
              </span>
            </div>
          )}
        </div>

        <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${project.progressPercent}%` }}
          />
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-cyan-400" />
            <span>Checklist Tasks ({project.tasks?.length || 0})</span>
          </h3>
          <span className="text-xs text-slate-400">Click circle to advance status</span>
        </div>

        {project.tasks?.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-400">
            <CheckSquare className="h-8 w-8 mx-auto text-slate-600 mb-2" />
            <p className="text-sm font-bold text-white">No tasks in this project</p>
            <p className="text-xs text-slate-500 mt-1">Add tasks like "Book Cab", "Verify Driver", or "Send Pickup Photo".</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {project.tasks?.map((task) => {
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
                      onClick={() => handleToggleTaskStatus(task)}
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

                      {task.dueDate && (
                        <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleOpenEditTask(task)}
                      className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                      title="Edit"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
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
      </div>

      {/* ADD / EDIT TASK MODAL */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title={editingTask ? 'Edit Task' : 'Add Checklist Task'}
      >
        <form onSubmit={handleSubmitTask} className="space-y-4 text-xs">
          {errorMessage && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-slate-300 uppercase font-semibold mb-1">Task Name</label>
            <input
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="e.g. Verify Driver & Number Plate"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 uppercase font-semibold mb-1">Description</label>
            <textarea
              value={taskDesc}
              onChange={(e) => setTaskDesc(e.target.value)}
              placeholder="e.g. Inspect number plate before boarding"
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
              onClick={() => setIsTaskModalOpen(false)}
              className="rounded-xl bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-extrabold px-5 py-2 shadow-lg shadow-cyan-400/20"
            >
              {editingTask ? 'Update Task' : 'Save Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
