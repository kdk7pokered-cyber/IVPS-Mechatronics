import React, { useState } from 'react';
import { Cog, Lock, Mail, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { GoogleSignInButton } from '../components/auth/GoogleSignInButton';

interface LoginPageProps {
  onNavigate: (view: string, params?: any) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, isLoading } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setUnverifiedEmail(null);
    try {
      await login(email, password);
      onNavigate('dashboard');
    } catch (err: any) {
      if (err.message && err.message.toLowerCase().includes('not verified')) {
        setUnverifiedEmail(email);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6 bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-lg shadow-amber-500/10">
            <Cog className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-white">Sign In to IVPS Mechatronics</h2>
          <p className="text-xs text-slate-400">
            Access protected broker contacts, machinery RFQs, and real-time inventory.
          </p>
        </div>

        {/* Google Sign-In Primary Authentication */}
        <div className="space-y-3">
          <GoogleSignInButton
            onSuccess={() => onNavigate('dashboard')}
            buttonText="Continue with Google"
          />
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-800"></div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">or sign in with password</span>
            <div className="flex-1 h-px bg-slate-800"></div>
          </div>
        </div>

        {/* Unverified Account Alert */}
        {unverifiedEmail && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <KeyRound className="w-4 h-4" />
              <span>Email Verification Required</span>
            </div>
            <p className="text-xs text-slate-300">
              Your account is registered but pending 6-digit OTP verification.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('register', { email: unverifiedEmail })}
              className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <span>Enter 6-Digit OTP Code</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Production Sign In Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Work Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 pl-9 text-xs text-white focus:outline-none transition"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                Password
              </label>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 pl-9 text-xs text-white focus:outline-none transition"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || isLoading}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{submitting ? 'Authenticating...' : 'Sign In to Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <span>
            Industrial accounts are protected with 256-bit encryption and tokenized broker contact authorization.
          </span>
        </div>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          Don't have a verified account?{' '}
          <button
            onClick={() => onNavigate('register')}
            className="text-amber-400 font-bold hover:underline"
          >
            Register as Buyer or Broker
          </button>
        </div>
      </div>
    </div>
  );
};
