import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  ShieldCheck,
  Sparkles,
  Camera,
  KeyRound,
  FolderKanban,
  Bot,
  ArrowRight,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 flex flex-col justify-between selection:bg-cyan-400 selection:text-black">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
            RIDESAFE <span className="text-cyan-400 font-extrabold text-sm px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/40">AI</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-sm font-semibold text-slate-300 hover:text-white transition"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500 transition"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-16 lg:py-24 w-full flex-1 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold text-cyan-400 mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Passenger-First Cab Booking + Project Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Move smarter. <br />
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
              Ride safer.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-300 leading-relaxed font-normal">
            RideSafe AI combines intelligent ride matching, transparent booking, and passenger-first
            safety tools in one connected platform — backed by synchronized project management.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/book-ride"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 px-7 py-3.5 text-sm font-extrabold text-slate-950 shadow-xl shadow-cyan-400/20 transition hover:scale-105"
            >
              <span>Book a Ride</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to="/safety"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 px-7 py-3.5 text-sm font-bold text-red-400 transition"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Explore Safety Center</span>
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 1. SmartMatch */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 hover:border-cyan-500/40 transition">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-4">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">SmartMatch Driver Intelligence</h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              Transparent, rule-based algorithmic scoring evaluating driver proximity (30%), arrival ETA (25%), safety ratings (20%), and vehicle class fit.
            </p>
          </div>

          {/* 2. Visual Pickup Assistance */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 hover:border-cyan-500/40 transition">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4">
              <Camera className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Visual Pickup Assistance</h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              Take or upload a photo of your surrounding landmark (e.g. SRM Gate 2) so your driver spots you immediately without awkward phone calls.
            </p>
          </div>

          {/* 3. Ride PIN & Vehicle Verification */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 hover:border-cyan-500/40 transition">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4">
              <KeyRound className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">4-Digit PIN & Plate Check</h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              Verify number plate and car color before entering. Rides cannot transition to STARTED until the driver verifies your secure 4-digit PIN.
            </p>
          </div>

          {/* 4. Safety Center & SOS */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 hover:border-red-500/40 transition">
            <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400 mb-4">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Safety Center & SOS</h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              High-visibility "I Don't Feel Safe" triggers, rapid SOS protocol, trusted contacts management, and secure trip sharing links.
            </p>
          </div>

          {/* 5. Project & Task Management */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 hover:border-amber-500/40 transition">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-4">
              <FolderKanban className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Trip Project Management</h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              Organize travel plans (e.g. "Chennai Airport Trip") with tasks ("Verify Driver", "Send Landmark Photo", "Start Ride"). Fully synchronized!
            </p>
          </div>

          {/* 6. AI Transportation Assistant */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 hover:border-purple-500/40 transition">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4">
              <Bot className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">RideSafe AI Assistant</h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              Chat for instant guidance on fares, safety protocols, pickup locations, driver details, and route deviation troubleshooting.
            </p>
          </div>
        </div>

        {/* Cross-Platform Parity Banner */}
        <div className="mt-16 rounded-3xl border border-cyan-500/20 bg-gradient-to-r from-slate-900 via-cyan-950/30 to-slate-900 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
              <Smartphone className="h-5 w-5" />
              <span>Unified Cross-Platform Architecture</span>
            </div>
            <h4 className="text-2xl font-extrabold text-white">One Account. One Database. Web + Android.</h4>
            <p className="text-sm text-slate-400 max-w-xl">
              Create a trip project or book a ride on Web; log into Android and pull-to-refresh to see exact real-time parity powered by PostgreSQL.
            </p>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Same REST API & JWT Token Auth</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Same PostgreSQL Database</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Zero hardcoded fake frontend state</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 px-6 py-6 text-center text-xs text-slate-400">
        <p>© 2026 RideSafe AI — Student Full-Stack & Passenger Safety Demonstration.</p>
        <p className="mt-1">Fictional drivers & simulated routes. SOS is a prototype interface; call 112 for real emergency response.</p>
      </footer>
    </div>
  );
};
