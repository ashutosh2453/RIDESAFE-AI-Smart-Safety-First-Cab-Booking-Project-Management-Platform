import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, Eye, EyeOff, AlertCircle, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login, sessionExpired, clearSessionExpired } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryParams = new URLSearchParams(location.search);
  const isExpired = sessionExpired || queryParams.get('expired') === '1';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (isExpired) {
      clearSessionExpired();
    }
  }, [isExpired, clearSessionExpired]);

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoCredentials = () => {
    setValue('email', 'demo@ridesafe.ai');
    setValue('password', 'Password123!');
  };

  return (
    <div className="min-h-screen bg-[#0B132B] flex flex-col items-center justify-center p-4 selection:bg-cyan-400 selection:text-black">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 group mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-xl shadow-cyan-500/25">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              RIDESAFE <span className="text-cyan-400 font-extrabold text-base px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800/40">AI</span>
            </span>
          </Link>
          <h2 className="text-xl font-extrabold text-white">Sign in to your account</h2>
          <p className="text-xs text-slate-400 mt-1">Smart cab booking and passenger safety dashboard</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          {/* Session Expired Banner */}
          {isExpired && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
              <span>Your session has expired. Please login again.</span>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                {...register('email')}
                className={`w-full rounded-xl border bg-slate-950/70 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition ${
                  errors.email
                    ? 'border-red-500 focus:ring-red-500/50'
                    : 'border-slate-800 focus:border-cyan-500 focus:ring-cyan-500/20'
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Password field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password')}
                  className={`w-full rounded-xl border bg-slate-950/70 px-4 py-3 pr-11 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition ${
                    errors.password
                      ? 'border-red-500 focus:ring-red-500/50'
                      : 'border-slate-800 focus:border-cyan-500 focus:ring-cyan-500/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 py-3 px-4 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill button */}
          <div className="mt-5 pt-4 border-t border-slate-800 text-center">
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium underline underline-offset-4"
            >
              ⚡ Fill Demo Credentials (demo@ridesafe.ai / Password123!)
            </button>
          </div>
        </div>

        {/* Link to Register */}
        <p className="mt-6 text-center text-xs text-slate-400">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-cyan-400 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};
