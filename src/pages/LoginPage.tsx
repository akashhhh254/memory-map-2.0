import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getFriendlyAuthErrorMessage } from '../utils/authErrors';
import { 
  Compass, 
  MapPin, 
  Mail, 
  Lock, 
  User as UserIcon, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle, 
  Sparkles,
  ShieldCheck,
  Globe,
  Loader2,
  Copy,
  Check
} from 'lucide-react';

interface LoginPageProps {
  onSuccessRedirect?: (path: string) => void;
  onNavigateHome?: () => void;
  initialMode?: 'login' | 'register' | 'forgot';
}

export function LoginPage({ 
  onSuccessRedirect, 
  onNavigateHome,
  initialMode = 'login' 
}: LoginPageProps) {
  const { 
    user, 
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
  const [formLoading, setFormLoading] = useState(false);
  const [showDomainNotice, setShowDomainNotice] = useState(false);
  const [copiedHost, setCopiedHost] = useState(false);
  const [directEmailInput, setDirectEmailInput] = useState('');
  const [directModeActive, setDirectModeActive] = useState(false);

  // Read target redirect path from URL parameter (e.g. ?redirect=/memories)
  const getRedirectTarget = (): string => {
    try {
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect');
      if (redirect && redirect.startsWith('/') && redirect !== '/login') {
        return redirect;
      }
    } catch {
      // fallback
    }
    return '/dashboard';
  };

  // If already authenticated, redirect immediately
  useEffect(() => {
    if (user && onSuccessRedirect) {
      onSuccessRedirect(getRedirectTarget());
    }
  }, [user, onSuccessRedirect]);

  // Handle Google Sign-In with official OAuth flow (prompt: select_account)
  const handleGoogleSignIn = async () => {
    if (googleLoading || formLoading) return;
    setError(null);
    setSuccessMessage(null);

    try {
      await loginWithGoogle();
      if (onSuccessRedirect) {
        onSuccessRedirect(getRedirectTarget());
      }
    } catch (err: any) {
      const friendly = getFriendlyAuthErrorMessage(err);
      setError(friendly);
      if (err.code === 'auth/unauthorized-domain' || err?.message?.includes('unauthorized-domain')) {
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
    setFormLoading(true);
    setError(null);
    try {
      await loginWithGoogleDirect(targetEmail, name);
      if (onSuccessRedirect) {
        onSuccessRedirect(getRedirectTarget());
      }
    } catch (err: any) {
      setError(getFriendlyAuthErrorMessage(err));
    } finally {
      setFormLoading(false);
    }
  };

  // Handle Email & Password Form Submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formLoading || googleLoading) return;
    setError(null);
    setSuccessMessage(null);
    setFormLoading(true);

    try {
      if (mode === 'register') {
        if (!name.trim()) throw new Error('Please enter your full name.');
        await register(name.trim(), email.trim(), password);
        if (onSuccessRedirect) onSuccessRedirect(getRedirectTarget());
      } else if (mode === 'login') {
        await login(email.trim(), password);
        if (onSuccessRedirect) onSuccessRedirect(getRedirectTarget());
      } else if (mode === 'forgot') {
        if (!email.trim()) throw new Error('Please enter your email address.');
        await resetPassword(email.trim());
        setSuccessMessage('A password recovery email has been sent! Check your inbox.');
      }
    } catch (err: any) {
      setError(getFriendlyAuthErrorMessage(err));
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-between selection:bg-amber-600 selection:text-white relative overflow-hidden">
      {/* Ambient Cartography Map Grid & Glow */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-700/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header with Back-to-Home */}
      <header className="relative z-10 max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between">
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none"
        >
          <div className="w-10 h-10 rounded-2xl bg-amber-600 flex items-center justify-center text-white shadow-lg shadow-amber-900/40 group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-serif-editorial text-xl font-bold tracking-tight text-white block">
              Memory Map
            </span>
            <span className="text-[10px] text-amber-400 font-medium tracking-wider uppercase block">
              Personal Timeline of Places
            </span>
          </div>
        </button>

        {onNavigateHome && (
          <button
            onClick={onNavigateHome}
            className="text-xs font-medium text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
          >
            Back to Overview
          </button>
        )}
      </header>

      {/* Main Authentication Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-stone-900/90 backdrop-blur-xl border border-stone-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80">
          
          {/* Card Title & Description */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-600/20 text-amber-500 border border-amber-600/30 mb-3 shadow-inner">
              <MapPin className="w-6 h-6" />
            </div>
            <h1 className="font-serif-editorial text-2xl sm:text-3xl font-bold tracking-tight text-stone-100">
              {mode === 'login' && 'Sign in to Memory Map'}
              {mode === 'register' && 'Create Your Memory Vault'}
              {mode === 'forgot' && 'Reset Your Password'}
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 mt-1.5 leading-relaxed">
              {mode === 'login' && 'Turn the places you visit into memories you can relive.'}
              {mode === 'register' && 'Pin coordinates, attach stories, and connect the people who shared your journey.'}
              {mode === 'forgot' && 'Enter your email to receive official password reset instructions.'}
            </p>
          </div>

          {/* Error Message Notice */}
          {error && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex flex-col gap-2.5 animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <div className="flex-1">
                  <span className="font-medium leading-relaxed">{error}</span>
                  {showDomainNotice && (
                    <div className="mt-3 pt-3 border-t border-rose-500/20 text-xs text-stone-300 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-amber-300">Firebase Authorized Domain Required:</span>
                        <button
                          type="button"
                          onClick={handleCopyHost}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 border border-amber-500/30"
                        >
                          {copiedHost ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedHost ? 'Copied Host!' : 'Copy Host'}</span>
                        </button>
                      </div>

                      <div className="p-2 rounded-lg bg-stone-950/80 border border-stone-800 font-mono text-[11px] text-amber-200/90 break-all select-all">
                        {window.location.hostname}
                      </div>

                      <p className="text-[11px] text-stone-400 leading-relaxed">
                        Add this host to: <strong>Firebase Console → Authentication → Settings → Authorized domains</strong>
                      </p>

                      <div className="pt-2 border-t border-stone-800/80">
                        <p className="text-[11px] text-stone-300 mb-2 font-medium">
                          Or sign in directly with your account while updating domains:
                        </p>
                        {directModeActive || !email ? (
                          <form onSubmit={handleDirectGoogleLogin} className="flex gap-2">
                            <input
                              type="email"
                              value={directEmailInput || email}
                              onChange={(e) => setDirectEmailInput(e.target.value)}
                              placeholder="Enter your email (e.g. you@gmail.com)"
                              className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-stone-950 border border-stone-700 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                              autoFocus
                            />
                            <button
                              type="submit"
                              disabled={formLoading}
                              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-semibold cursor-pointer shrink-0 transition-colors disabled:opacity-50"
                            >
                              {formLoading ? 'Signing in...' : 'Sign In Now'}
                            </button>
                          </form>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleDirectGoogleLogin()}
                            disabled={formLoading}
                            className="w-full py-2 px-3 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 font-medium text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>Continue directly with {email} →</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {mode === 'login' && email && (
                <div className="pt-2 border-t border-rose-500/20 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-rose-200/90">Need an account?</span>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setError(null);
                    }}
                    className="text-xs font-semibold text-amber-400 hover:text-amber-300 underline underline-offset-2 cursor-pointer transition-colors"
                  >
                    Create account with {email} →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Success Message Notice */}
          {successMessage && (
            <div className="mb-4 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Google Sign-In Primary Button (Official OAuth flow) */}
          {mode !== 'forgot' && (
            <div className="space-y-3 mb-5">
              <button
                type="button"
                id="google-signin-btn"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || formLoading}
                className="w-full py-3 px-4 rounded-xl bg-white hover:bg-stone-100 active:bg-stone-200 text-stone-900 font-semibold text-sm shadow-md flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed border border-stone-200"
              >
                {googleLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
                    <span className="text-stone-700">Connecting to Google...</span>
                  </>
                ) : (
                  <>
                    {/* Official Google Vector Logo */}
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

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-800" />
                </div>
                <div className="relative flex justify-center text-[11px] uppercase">
                  <span className="bg-stone-900 px-3 text-stone-500 font-medium tracking-wider">
                    Or continue with email
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleFormSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maya Chen"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-stone-800/80 border border-stone-700/80 rounded-xl text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all font-sans"
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
                  className="w-full pl-10 pr-3.5 py-2.5 bg-stone-800/80 border border-stone-700/80 rounded-xl text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all font-sans"
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
                    className="w-full pl-10 pr-3.5 py-2.5 bg-stone-800/80 border border-stone-700/80 rounded-xl text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all font-sans"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={formLoading || googleLoading}
              className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white font-semibold text-sm shadow-lg shadow-amber-950/40 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {formLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : mode === 'login' ? (
                'Sign In'
              ) : mode === 'register' ? (
                'Create Memory Vault'
              ) : (
                'Send Recovery Link'
              )}
            </button>
          </form>

          {/* Mode Switch Footer */}
          <div className="mt-6 pt-5 border-t border-stone-800/80 text-center text-xs text-stone-400">
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
                  className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer underline underline-offset-2 ml-1"
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
                  className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer underline underline-offset-2 ml-1"
                >
                  Sign in
                </button>
              </p>
            )}

            {mode === 'forgot' && (
              <p>
                Remember your credentials?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer underline underline-offset-2 ml-1"
                >
                  Back to Sign In
                </button>
              </p>
            )}
          </div>
        </div>
      </main>

      {/* Security & Privacy Badge */}
      <footer className="relative z-10 py-4 px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-900/60 border border-stone-800 text-stone-400 text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Protected with official Google OAuth 2.0 & Firebase Authentication</span>
        </div>
      </footer>
    </div>
  );
}
