import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, Eye, EyeOff, AlertCircle, ArrowRight, Loader2, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    phoneNumber: z.string().optional(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const passwordValue = watch('password', '');

  // Calculate password strength
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strength = getPasswordStrength(passwordValue);

  const getStrengthLabel = (score: number) => {
    switch (score) {
      case 0:
      case 1:
        return { label: 'Weak', color: 'bg-red-500', text: 'text-red-400' };
      case 2:
        return { label: 'Fair', color: 'bg-amber-500', text: 'text-amber-400' };
      case 3:
        return { label: 'Good', color: 'bg-blue-500', text: 'text-blue-400' };
      case 4:
        return { label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-400' };
      default:
        return { label: 'Weak', color: 'bg-red-500', text: 'text-red-400' };
    }
  };

  const strengthInfo = getStrengthLabel(strength);

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await authRegister(data.name, data.email, data.password, data.phoneNumber);
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
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
          <h2 className="text-xl font-extrabold text-white">Create your account</h2>
          <p className="text-xs text-slate-400 mt-1">Join the safety-first smart transportation network</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          {/* Error Message */}
          {errorMessage && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Ashutosh Sharma"
                {...register('name')}
                className={`w-full rounded-xl border bg-slate-950/70 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition ${
                  errors.name
                    ? 'border-red-500 focus:ring-red-500/50'
                    : 'border-slate-800 focus:border-cyan-500 focus:ring-cyan-500/20'
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                placeholder="ashutosh@example.com"
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

            {/* Phone Number (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                {...register('phoneNumber')}
                className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition"
              />
            </div>

            {/* Password */}
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

              {/* Password strength meter */}
              {passwordValue && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Strength:</span>
                    <span className={`font-bold ${strengthInfo.text}`}>{strengthInfo.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex gap-1">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-full flex-1 rounded-full transition-all ${
                          strength >= step ? strengthInfo.color : 'bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('confirmPassword')}
                className={`w-full rounded-xl border bg-slate-950/70 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition ${
                  errors.confirmPassword
                    ? 'border-red-500 focus:ring-red-500/50'
                    : 'border-slate-800 focus:border-cyan-500 focus:ring-cyan-500/20'
                }`}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-400">{errors.confirmPassword.message}</p>
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
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Link to Login */}
        <p className="mt-6 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-cyan-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
