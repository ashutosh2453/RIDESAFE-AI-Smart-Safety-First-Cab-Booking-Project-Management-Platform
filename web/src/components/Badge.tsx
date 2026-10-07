import React from 'react';
import { ProjectStatus, TaskPriority, TaskStatus, RideStatus } from '../types';

interface BadgeProps {
  status?: ProjectStatus | TaskStatus | RideStatus;
  priority?: TaskPriority;
  text?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ status, priority, text, size = 'sm' }) => {
  let colorStyles = 'bg-slate-800 text-slate-300 border-slate-700';
  let label = text || status || priority || '';

  // Priorities
  if (priority === 'HIGH') {
    colorStyles = 'bg-red-500/10 text-red-400 border-red-500/30';
  } else if (priority === 'MEDIUM') {
    colorStyles = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  } else if (priority === 'LOW') {
    colorStyles = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
  }

  // Statuses
  if (status === 'COMPLETED') {
    colorStyles = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  } else if (status === 'IN_PROGRESS' || status === 'STARTED') {
    colorStyles = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
  } else if (status === 'PENDING' || status === 'NOT_STARTED' || status === 'REQUESTED') {
    colorStyles = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  } else if (status === 'CANCELLED') {
    colorStyles = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
  } else if (status === 'DRIVER_ASSIGNED' || status === 'DRIVER_ARRIVING' || status === 'DRIVER_ARRIVED') {
    colorStyles = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
  }

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border tracking-wide uppercase ${sizeClass} ${colorStyles}`}
    >
      {label.replace('_', ' ')}
    </span>
  );
};
