import React, { useState, useEffect } from 'react';
import { Cog, Lock, Mail, Phone, ArrowRight, ShieldCheck, KeyRound, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { GoogleSignInButton } from '../components/auth/GoogleSignInButton';

interface RegisterPageProps {
  onNavigate: (view: string) => void;
  initialEmail?: string;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate, initialEmail = '' }) => {
  const { register, verifyOtp, resendOtp, isLoading } = useAuth();
  const { showToast } = useToast();

  // Registration Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [company, setCompany] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [role, setRole] = useState<'buyer' | 'broker'>('buyer');
  const [submitting, setSubmitting] = useState(false);

  // OTP Verification Step State
  const [step, setStep] = useState<'form' | 'verify'>(initialEmail ? 'verify' : 'form');
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState<string | undefined>(undefined);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    let timer: any;
    if (step === 'verify' && countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showToast('Passwords do not match. Please re-enter your password.', 'error');
      return;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }
    if (!phone || phone.trim().length < 10) {
      showToast('Please provide a valid 10-digit mobile number.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await register({
        name,
        email,
        phone,
        password,
        confirm_password: confirmPassword,
        role,
        company: company.trim() || undefined,
        business_description: businessDescription.trim() || undefined
      });

      if (res.dev_otp) {
        setDevOtp(res.dev_otp);
      }
      setStep('verify');
      setCountdown(60);
    } catch {
      // toast shown in context
    } finally {
      setSubmitting(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      showToast('Please enter the complete 6-digit verification code.', 'error');
      return;
    }

    setVerifying(true);
    try {
      await verifyOtp(email, otp);
      onNavigate(role === 'broker' ? 'dashboard' : 'landing');
    } catch {
      // toast shown in context
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    try {
      const res = await resendOtp(email);
      if (res.dev_otp) {
        setDevOtp(res.dev_otp);
      }
      setCountdown(60);
    } catch {
      // toast shown in context
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl relative">
        {step === 'form' ? (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                <Cog className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-black text-white">Create Commercial Account</h2>
              <p className="text-xs text-slate-400">
                Register on IVPS Mechatronics — India's Premier B2B Heavy Machinery Exchange
              </p>
            </div>

            {/* Account Role Selector - STRICTLY BUYER OR BROKER */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                Select Your Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('buyer')}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                    role === 'buyer'
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500 ring-1 ring-blue-500/50'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="font-black text-sm text-white">Industrial Buyer</span>
                  <span className="text-[11px] text-slate-400 mt-1">
                    Procure new & second-hand machines, unlock broker contacts & send RFQs.
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('broker')}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                    role === 'broker'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500 ring-1 ring-amber-500/50'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="font-black text-sm text-white">Certified Broker</span>
                  <span className="text-[11px] text-slate-400 mt-1">
                    List machines for sale, receive qualified buyer leads & manage enquiries.
                  </span>
                </button>
              </div>
            </div>

            {/* Instant Google Registration with Selected Role */}
            <div className="space-y-3">
              <GoogleSignInButton
                role={role}
                onSuccess={() => onNavigate(role === 'broker' ? 'dashboard' : 'landing')}
                buttonText={`Register as ${role === 'broker' ? 'Certified Broker' : 'Industrial Buyer'} with Google`}
              />
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-800"></div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  or register with password & email
                </span>
                <div className="flex-1 h-px bg-slate-800"></div>
              </div>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kulkarni"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Company / Organization Name {role === 'broker' ? '*' : '(Optional)'}
                </label>
                <input
                  type="text"
                  required={role === 'broker'}
                  placeholder={role === 'broker' ? 'e.g. Apex Industrial Machinery Brokerage' : 'e.g. Kulkarni Automotive Pvt Ltd'}
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Work Email *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 pl-9 text-white focus:outline-none"
                    />
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Mobile Number *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      placeholder="+91 98200 12345"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 pl-9 text-white focus:outline-none"
                    />
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  </div>
                </div>
              </div>

              {role === 'broker' && (
                <div>
                  <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Brokerage Profile / Machinery Specialization
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Describe your machinery brokerage specialization (e.g. CNC Lathes, Injection Molding, Heavy Hydraulic Presses)..."
                    value={businessDescription}
                    onChange={(e) => setBusinessDescription(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-white focus:outline-none"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      placeholder="Min 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 pl-9 text-white focus:outline-none"
                    />
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      placeholder="Repeat password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 pl-9 text-white focus:outline-none"
                    />
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>
                  By registering, a 6-digit verification code will be sent to your email address to confirm identity before account activation.
                </span>
              </div>

              <button
                type="submit"
                disabled={submitting || isLoading}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                <span>{submitting ? 'Generating Verification OTP...' : 'Continue to Email Verification'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
              Already have a verified account?{' '}
              <button
                onClick={() => onNavigate('login')}
                className="text-amber-400 font-bold hover:underline"
              >
                Sign In
              </button>
            </div>
          </div>
        ) : (
          /* Step 2: 6-Digit Email OTP Verification Screen */
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400 shadow-lg shadow-amber-500/10">
                <KeyRound className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-white">Verify Your Email Address</h2>
              <p className="text-xs text-slate-400">
                We sent a 6-digit verification code to:
              </p>
              <div className="inline-block px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-amber-300 font-mono text-xs font-bold">
                {email}
              </div>
            </div>

            {devOtp && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold uppercase tracking-wider block text-[10px] text-amber-400">
                    Verification Code (Dev / Evaluation)
                  </span>
                  <span className="font-mono text-base font-black tracking-widest text-white">{devOtp}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setOtp(devOtp)}
                  className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition"
                >
                  Auto-Fill
                </button>
              </div>
            )}

            <form onSubmit={handleOtpSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
                  Enter 6-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full tracking-[0.5em] text-center font-mono text-2xl font-black bg-slate-950 border-2 border-slate-700 focus:border-amber-400 rounded-2xl py-3 text-white focus:outline-none transition shadow-inner"
                />
              </div>

              <button
                type="submit"
                disabled={verifying || otp.length !== 6}
                className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 transition flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>{verifying ? 'Verifying Code...' : 'Verify & Activate Account'}</span>
              </button>
            </form>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="text-slate-400 hover:text-white transition"
              >
                ← Back to Edit Details
              </button>

              <button
                type="button"
                disabled={countdown > 0 || resending}
                onClick={handleResend}
                className="text-amber-400 font-bold hover:underline disabled:text-slate-600 disabled:no-underline flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                <span>
                  {countdown > 0 ? `Resend Code in ${countdown}s` : 'Resend Code Now'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
