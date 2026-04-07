import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Zap, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { addNotification, getNotifications } from '@/lib/notificationStorage';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function LoginPage() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const from       = (location.state as { from?: string })?.from ?? '/dashboard';

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (!res.ok) { setError(res.error ?? 'Sign in failed.'); return; }
    if (getNotifications().length === 0) {
      addNotification({ title: 'Welcome back! 👋', message: 'Pick up where you left off.', type: 'info' });
    }
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'hsl(var(--background))' }}>
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full opacity-[0.07] blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #007AFF, transparent)' }} />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full opacity-[0.05] blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #5856D6, transparent)' }} />
      <div className="absolute top-4 right-4"><ThemeToggle /></div>

      <div className="w-full max-w-sm animate-spring-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-2.5 mb-7">
            <div className="h-12 w-12 squircle-sm gradient-primary flex items-center justify-center"
              style={{ boxShadow: '0 4px 20px rgba(0,122,255,0.45)' }}>
              <Zap className="h-6 w-6 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[22px] font-bold tracking-tight"
              style={{ fontFamily: '-apple-system, "SF Pro Display", sans-serif', letterSpacing: '-0.4px' }}>
              DevSync Hub
            </span>
          </Link>
          <h1 className="text-[28px] font-bold text-center"
            style={{ fontFamily: '-apple-system, "SF Pro Display", sans-serif', letterSpacing: '-0.5px' }}>
            Welcome back
          </h1>
          <p className="text-muted-foreground text-[15px] mt-1.5 text-center">
            Sign in to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <div className="rounded-xl px-4 py-3 text-[13px] font-medium text-destructive"
              style={{ background: 'rgba(255,59,48,0.09)' }}>
              {error}
            </div>
          )}
          <div className="rounded-2xl overflow-hidden border bg-card">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Email address" autoComplete="email" required
              className="w-full px-4 py-3.5 bg-transparent text-[15px] outline-none border-b border-border/60"
              style={{ fontFamily: '-apple-system, "SF Pro Text", sans-serif' }} />
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password" autoComplete="current-password" required
                className="w-full px-4 py-3.5 pr-12 bg-transparent text-[15px] outline-none"
                style={{ fontFamily: '-apple-system, "SF Pro Text", sans-serif' }} />
              <button type="button" onClick={() => setShowPw(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg">
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className={cn(
              'w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white text-[15px] font-semibold transition-all select-none',
              loading ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90 active:scale-[0.98]',
            )}
            style={{ background: 'linear-gradient(145deg,#409CFF,#007AFF)', boxShadow: '0 4px 18px rgba(0,122,255,0.4)' }}>
            {loading
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <><span>Sign In</span><ArrowRight className="h-4 w-4" /></>}
          </button>
        </form>

        <p className="text-center text-[14px] text-muted-foreground mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-[#007AFF] dark:text-[#0A84FF] font-semibold hover:underline">
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}
