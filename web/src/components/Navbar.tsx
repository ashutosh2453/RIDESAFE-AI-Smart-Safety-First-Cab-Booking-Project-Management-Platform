import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, ShieldAlert, Car, User, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-[#0B132B]/90 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left: Mobile Menu Toggle & Brand */}
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <button
              onClick={onToggleSidebar}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white flex items-center gap-1">
                RIDESAFE <span className="text-cyan-400 font-extrabold text-sm px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40">AI</span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase -mt-0.5 hidden sm:block">
                Smart & Safety-First Platform
              </p>
            </div>
          </Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Quick Book Ride CTA */}
              <Link
                to="/book-ride"
                className="hidden sm:flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3.5 py-2 text-xs font-semibold text-white transition shadow-sm"
              >
                <Car className="h-4 w-4 text-cyan-400" />
                <span>Book Ride</span>
              </Link>

              {/* Instant Emergency SOS Access */}
              <Link
                to="/safety"
                className="flex items-center gap-1.5 rounded-xl bg-red-600/90 hover:bg-red-500 border border-red-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-red-500/30 transition animate-pulse"
                title="Open Emergency Safety Center"
              >
                <ShieldAlert className="h-4 w-4" />
                <span className="tracking-wide">SOS CENTER</span>
              </Link>

              {/* User Dropdown / Profile */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-slate-800/80 transition"
                  title="View Profile"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400 font-bold text-xs">
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <span className="hidden lg:inline text-xs font-semibold text-slate-200">
                    {user?.name}
                  </span>
                </Link>

                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-semibold text-slate-300 hover:text-white px-3 py-1.5 transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2 text-sm font-bold shadow-lg shadow-cyan-500/20 transition"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
