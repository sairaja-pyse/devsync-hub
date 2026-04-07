import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Zap, ArrowRight, Loader2, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { addNotification } from '@/lib/notificationStorage';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: 'At least 6 characters', ok: password.length >= 6 },
    { label: 'Contains a number',     ok: /\d/.test(password) },
    { label: 'Contains a letter',     ok: /[a-zA-Z]/.test(password) },
  ];
  if (!password) return null;
  return (
    <div className="space-y-1 px-1 pt-1">
      {checks.map(c => (
        <div key={c.label} className="flex items-center gap-1.5">
          <div className={cn('h-3.5 w-3.5 rounded-full flex items-center justify-center',
            c.ok ? 'bg-[#34C759]' : 'bg-muted-foreground/20')}>
            {c.ok && <Check className="h-2 w-2 text-white" strokeWidth={3} />}
          </div>
          <span className={cn('text-[11px]', c.ok ? 'text-[#34C759]' : 'text-muted-foreground/60')}>
            {c.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function SignupPage() {
  const { signup, loginWithGoogle } = useAuth();
  const navigate   = useNavigate();

  const [name,    setName]    = useState('');
  const [email,   setEmail]   = useState('');
  const [pw,      setPw]      = useState('');
  const [pw2,     setPw2]     = useState('');
  const [showPw,  setShowPw]  = useState(false);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !email.trim() || !pw || !pw2) {
      setError('Please fill in all fields.'); return;
    }
    if (pw.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (pw !== pw2)    { setError('Passwords do not match.'); return; }
    setLoading(true);
    const res = await signup(name.trim(), email.trim(), pw);
    setLoading(false);
    if (!res.ok) { setError(res.error ?? 'Sign up failed.'); return; }
    addNotification({
      title:   `Welcome to DevSync Hub, ${name.trim().split(' ')[0]}! 🎉`,
      message: 'Start by adding your goals, projects, and tasks.',
      type:    'success',
    });
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'hsl(var(--background))' }}>
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full opacity-[0.07] blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #34C759, transparent)' }} />
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full opacity-[0.05] blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #007AFF, transparent)' }} />
      <div className="absolute top-4 right-4"><ThemeToggle /></div>

      <div className="w-full max-w-sm animate-spring-in">
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
            Create account
          </h1>
          <p className="text-muted-foreground text-[15px] mt-1.5 text-center">
            Start your productivity journey
          </p>
        </div>

        {/* Google Sign-Up */}
        <button
          type="button"
          disabled={loading}
          onClick={async () => {
            setError('');
            setLoading(true);
            const res = await loginWithGoogle();
            setLoading(false);
            if (!res.ok) { setError(res.error ?? 'Google sign-in failed.'); return; }
            navigate('/dashboard', { replace: true });
          }}
          className={cn(
            'w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl text-[15px] font-semibold border transition-all select-none mb-3',
            'bg-card hover:bg-secondary/60 active:scale-[0.98]',
            loading ? 'opacity-70 cursor-not-allowed' : '',
          )}
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
          </svg>
          Sign up with Google
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 h-px bg-border/60" />
          <span className="text-[12px] text-muted-foreground/60 font-medium">or</span>
          <div className="flex-1 h-px bg-border/60" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <div className="rounded-xl px-4 py-3 text-[13px] font-medium text-destructive"
              style={{ background: 'rgba(255,59,48,0.09)' }}>
              {error}
            </div>
          )}
          <div className="rounded-2xl overflow-hidden border bg-card">
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="Full name" autoComplete="name" required
              className="w-full px-4 py-3.5 bg-transparent text-[15px] outline-none border-b border-border/60"
              style={{ fontFamily: '-apple-system, "SF Pro Text", sans-serif' }} />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Email address" autoComplete="email" required
              className="w-full px-4 py-3.5 bg-transparent text-[15px] outline-none border-b border-border/60"
              style={{ fontFamily: '-apple-system, "SF Pro Text", sans-serif' }} />
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={pw}
                onChange={e => setPw(e.target.value)}
                placeholder="Password" autoComplete="new-password" required
                className="w-full px-4 py-3.5 pr-12 bg-transparent text-[15px] outline-none border-b border-border/60"
                style={{ fontFamily: '-apple-system, "SF Pro Text", sans-serif' }} />
              <button type="button" onClick={() => setShowPw(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg">
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <input type="password" value={pw2} onChange={e => setPw2(e.target.value)}
              placeholder="Confirm password" autoComplete="new-password" required
              className="w-full px-4 py-3.5 bg-transparent text-[15px] outline-none"
              style={{ fontFamily: '-apple-system, "SF Pro Text", sans-serif' }} />
          </div>

          <PasswordStrength password={pw} />

          <button type="submit" disabled={loading}
            className={cn(
              'w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white text-[15px] font-semibold transition-all select-none',
              loading ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90 active:scale-[0.98]',
            )}
            style={{ background: 'linear-gradient(145deg,#409CFF,#007AFF)', boxShadow: '0 4px 18px rgba(0,122,255,0.4)' }}>
            {loading
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <><span>Create Account</span><ArrowRight className="h-4 w-4" /></>}
          </button>
        </form>

        <p className="text-center text-[14px] text-muted-foreground mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-[#007AFF] dark:text-[#0A84FF] font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
