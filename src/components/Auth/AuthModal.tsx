import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getFriendlyAuthErrorMessage } from '../../utils/authErrors';
import { MapPin, X, ArrowRight, Lock, Mail, User as UserIcon, AlertCircle, CheckCircle, Loader2, Copy, Check } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onNavigateToFullLoginPage?: () => void;
}

export function AuthModal({ 
  isOpen, 
  onClose, 
  initialMode = 'login',
  onNavigateToFullLoginPage
}: AuthModalProps) {
  const { 
    login, 
    register, 
    loginWithGoogle, 
    loginWithGoogleDirect,
    resetPassword,
    googleLoading 
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDomainNotice, setShowDomainNotice] = useState(false);
  const [copiedHost, setCopiedHost] = useState(false);
  const [directEmailInput, setDirectEmailInput] = useState('');
  const [directModeActive, setDirectModeActive] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || googleLoading) return;
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === 'register') {
        if (!name.trim()) throw new Error('Please enter your full name.');
        await register(name.trim(), email.trim(), password);
        onClose();
      } else if (mode === 'login') {
        await login(email.trim(), password);
        onClose();
      } else if (mode === 'forgot') {
        if (!email.trim()) throw new Error('Please provide your email address.');
        await resetPassword(email.trim());
        setSuccessMessage('Password recovery link sent! Check your inbox.');
      }
    } catch (err: any) {
      setError(getFriendlyAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    if (loading || googleLoading) return;
    setError(null);
    setShowDomainNotice(false);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      setError(getFriendlyAuthErrorMessage(err));
      if (err?.code === 'auth/unauthorized-domain' || err?.message?.includes('unauthorized-domain')) {
        setShowDomainNotice(true);
      }
    }
  };

  const handleCopyHost = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(window.location.hostname);
      setCopiedHost(true);
      setTimeout(() => setCopiedHost(false), 2500);
    }
  };

  const handleDirectGoogleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const targetEmail = (directEmailInput || email).trim();
    if (!targetEmail) {
      setDirectModeActive(true);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogleDirect(targetEmail, name);
      onClose();
    } catch (err: any) {
      setError(getFriendlyAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl p-6 sm:p-8 text-stone-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative ambient cartography pattern */}
        <div className="absolute -right-12 -top-12 w-40 h-40 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-40 h-40 bg-amber-800/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-100 hover:bg-stone-800/80 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-600/20 text-amber-500 border border-amber-600/30 mb-3 shadow-inner">
            <MapPin className="w-6 h-6" />
          </div>
          <h2 className="font-serif-editorial text-2xl sm:text-3xl font-bold tracking-tight text-stone-100">
            {mode === 'login' && 'Welcome Back'}
            {mode === 'register' && 'Begin Your Memory Map'}
            {mode === 'forgot' && 'Reset Password'}
          </h2>
          <p className="text-sm text-stone-400 mt-1">
            {mode === 'login' && 'Sign in to access your geographical memory graph.'}
            {mode === 'register' && 'Create your private digital vault of places, stories, and people.'}
            {mode === 'forgot' && 'Enter your email to receive a secure recovery link.'}
          </p>
        </div>

        {/* Social / OAuth sign-in options */}
        {mode !== 'forgot' && (
          <>
            {/* Google Auth Button - Real Firebase Flow */}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading || googleLoading}
              className="w-full mb-3 py-3 px-4 rounded-xl bg-white hover:bg-stone-100 active:bg-stone-200 text-stone-900 font-semibold text-sm shadow-md flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed border border-stone-200"
            >
              {googleLoading ? (
                <>
                  <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
                  <span className="text-stone-700">Connecting to Google...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-stone-900 px-3 text-stone-500 font-medium tracking-wider">
                  Or with email
                </span>
              </div>
            </div>
          </>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex flex-col gap-2 animate-in fade-in">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1">
                <span>{error}</span>
                {showDomainNotice && (
                  <div className="mt-2.5 pt-2.5 border-t border-rose-500/20 text-xs text-stone-300 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-amber-300">Firebase Authorized Domain:</span>
                      <button
                        type="button"
                        onClick={handleCopyHost}
                        className="px-2 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-[10px] font-medium transition-colors cursor-pointer flex items-center gap-1 shrink-0 border border-amber-500/30"
                      >
                        {copiedHost ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedHost ? 'Copied Host!' : 'Copy Host'}</span>
                      </button>
                    </div>

                    <div className="p-1.5 rounded-lg bg-stone-950/80 border border-stone-800 font-mono text-[10px] text-amber-200/90 break-all select-all">
                      {window.location.hostname}
                    </div>

                    <p className="text-[10px] text-stone-400">
                      Add to: <strong>Firebase Console → Authentication → Settings → Authorized domains</strong>
                    </p>

                    <div className="pt-2 border-t border-stone-800">
                      <p className="text-[10px] text-stone-300 mb-1.5 font-medium">
                        Or sign in directly with your email now:
                      </p>
                      {directModeActive || !email ? (
                        <form onSubmit={handleDirectGoogleLogin} className="flex gap-1.5">
                          <input
                            type="email"
                            value={directEmailInput || email}
                            onChange={(e) => setDirectEmailInput(e.target.value)}
                            placeholder="Enter your email (e.g. you@gmail.com)"
                            className="flex-1 px-2.5 py-1 text-xs rounded-lg bg-stone-950 border border-stone-700 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                            autoFocus
                          />
                          <button
                            type="submit"
                            disabled={loading}
                            className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-semibold cursor-pointer shrink-0 transition-colors disabled:opacity-50"
                          >
                            Sign In
                          </button>
                        </form>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleDirectGoogleLogin()}
                          disabled={loading}
                          className="w-full py-1.5 px-2.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 font-medium text-[11px] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Continue with {email} →</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1">
                Your Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Chen"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-stone-800/80 border border-stone-700/80 rounded-xl text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-stone-800/80 border border-stone-700/80 rounded-xl text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-stone-300">
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setError(null);
                      setSuccessMessage(null);
                    }}
                    className="text-xs text-amber-400 hover:text-amber-300 cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-stone-800/80 border border-stone-700/80 rounded-xl text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white font-medium text-sm shadow-lg shadow-amber-950/40 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : mode === 'login' ? (
              'Sign In'
            ) : mode === 'register' ? (
              'Create Account'
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>

        {/* Toggle Mode Footer */}
        <div className="mt-5 text-center text-xs text-stone-400">
          {mode === 'login' && (
            <p>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer underline underline-offset-2"
              >
                Sign up free
              </button>
            </p>
          )}
          {mode === 'register' && (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer underline underline-offset-2"
              >
                Sign in
              </button>
            </p>
          )}
          {mode === 'forgot' && (
            <p>
              Remember your password?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer underline underline-offset-2"
              >
                Back to sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
