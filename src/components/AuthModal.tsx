import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Mail, Lock, Sparkles, User, CheckCircle2, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onUserChange: (user: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, user, onUserChange }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password
        });
        if (error) throw error;
        if (data.user) {
          onUserChange(data.user);
          setSuccessMsg('Account created! Welcome to StackPulse.');
          setTimeout(onClose, 1200);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        if (data.user) {
          onUserChange(data.user);
          setSuccessMsg('Logged in successfully!');
          setTimeout(onClose, 1200);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    onUserChange({ email: 'nate.asp@supabase.com', role: 'enterprise_reviewer' });
    setSuccessMsg('Signed in as Guest Reviewer!');
    setTimeout(onClose, 800);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[#0B0F19] border border-[#1F2937] rounded-2xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#3ECF8E]/10 border border-[#3ECF8E]/20 flex items-center justify-center text-[#3ECF8E] mx-auto mb-3 glow-supabase">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            {isSignUp ? 'Create a StackPulse Account' : 'Sign In to StackPulse'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Powered by Supabase Auth with Row Level Security
          </p>
        </div>

        {/* Feedback Alerts */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-800/40 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-[#3ECF8E]/10 border border-[#3ECF8E]/30 text-[#3ECF8E] text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleAuth} className="space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Work Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#111827] border border-[#1F2937] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#3ECF8E] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#111827] border border-[#1F2937] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#3ECF8E] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-[#3ECF8E] hover:bg-[#34B87E] text-slate-950 font-bold text-xs transition-all shadow-lg shadow-[#3ECF8E]/20 active:scale-95 disabled:opacity-50 mt-2"
          >
            {loading ? 'Authenticating...' : isSignUp ? 'Create Free Account' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-4 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#1F2937]"></div>
          </div>
          <span className="relative bg-[#0B0F19] px-3 text-[11px] text-slate-500 uppercase tracking-wider">
            Or continue instantly
          </span>
        </div>

        {/* Continue as Guest Button */}
        <button
          type="button"
          onClick={handleDemoLogin}
          className="w-full py-2.5 rounded-xl bg-[#111827] hover:bg-slate-800 text-slate-200 border border-[#1F2937] font-semibold text-xs transition-all flex items-center justify-center gap-2 hover:border-slate-700 active:scale-95"
        >
          <User className="w-3.5 h-3.5 text-[#3ECF8E]" />
          <span>Continue as Guest Reviewer</span>
        </button>

        {/* Toggle Mode */}
        <div className="mt-4 text-center text-xs text-slate-400">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[#3ECF8E] hover:underline font-semibold"
          >
            {isSignUp ? 'Sign In' : 'Create One'}
          </button>
        </div>
      </div>
    </div>
  );
};
