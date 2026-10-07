import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, Mail, Phone, Calendar, Shield, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto animate-fadeIn">
      {/* Title */}
      <div className="border-b border-slate-800 pb-5">
        <span className="text-xs font-black tracking-widest uppercase text-cyan-400">
          ACCOUNT PROFILE
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
          Passenger Profile
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your verified credentials and authentication session
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-extrabold text-2xl text-slate-950 shadow-xl shadow-cyan-500/20">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user?.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold text-cyan-400 bg-cyan-950 border border-cyan-800 px-2 py-0.5 rounded-full uppercase">
                {user?.role || 'PASSENGER'}
              </span>
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Verified Account</span>
              </span>
            </div>
          </div>
        </div>

        {/* Profile Information List */}
        <div className="space-y-4 text-xs">
          <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-800 bg-slate-950/60">
            <Mail className="h-4 w-4 text-slate-400" />
            <div className="flex-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Email Address</span>
              <span className="text-white font-medium">{user?.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-800 bg-slate-950/60">
            <Phone className="h-4 w-4 text-slate-400" />
            <div className="flex-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Phone Number</span>
              <span className="text-white font-medium">{user?.phoneNumber || 'Not registered'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-800 bg-slate-950/60">
            <Calendar className="h-4 w-4 text-slate-400" />
            <div className="flex-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Account Created</span>
              <span className="text-white font-medium">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active Member'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-800 bg-slate-950/60">
            <Shield className="h-4 w-4 text-emerald-400" />
            <div className="flex-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Safety Authentication</span>
              <span className="text-emerald-300 font-medium">Bcrypt Encrypted & JWT Secured</span>
            </div>
          </div>
        </div>

        {/* Logout Action */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-400 font-bold px-5 py-2.5 text-xs transition"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out of Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};
