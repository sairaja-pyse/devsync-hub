import { useState } from 'react';
import { useTheme } from 'next-themes';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Sun, Moon, Monitor, Eye, EyeOff, Loader2, LogOut, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user, logout, updateProfile, changePassword } = useAuth();
  const navigate = useNavigate();

  // Profile form
  const [name,       setName]       = useState(user?.name ?? '');
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Password form
  const [currentPw, setCurrentPw] = useState('');
  const [newPw,     setNewPw]     = useState('');
  const [showCur,   setShowCur]   = useState(false);
  const [showNew,   setShowNew]   = useState(false);
  const [pwMsg,     setPwMsg]     = useState<{ ok: boolean; text: string } | null>(null);
  const [savingPw,  setSavingPw]  = useState(false);

  const themes = [
    { value: 'light',  label: 'Light',  icon: Sun },
    { value: 'dark',   label: 'Dark',   icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSavingProfile(true);
    setProfileMsg(null);
    const res = await updateProfile(name.trim());
    setSavingProfile(false);
    setProfileMsg(res.ok
      ? { ok: true, text: 'Profile updated.' }
      : { ok: false, text: res.error ?? 'Failed to update.' });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPw || !newPw) return;
    if (newPw.length < 6) { setPwMsg({ ok: false, text: 'New password must be at least 6 characters.' }); return; }
    setSavingPw(true);
    setPwMsg(null);
    const res = await changePassword(currentPw, newPw);
    setSavingPw(false);
    if (res.ok) {
      setPwMsg({ ok: true, text: 'Password changed successfully.' });
      setCurrentPw('');
      setNewPw('');
    } else {
      setPwMsg({ ok: false, text: res.error ?? 'Failed to change password.' });
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <form onSubmit={handleSaveProfile} className="rounded-xl border bg-card p-6 space-y-5">
        <h2 className="font-semibold text-[16px]">Profile</h2>

        {/* Avatar preview */}
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full gradient-primary flex items-center justify-center shrink-0"
            style={{ boxShadow: '0 4px 12px rgba(0,122,255,0.35)' }}>
            <span className="text-white text-lg font-bold">{user?.initials ?? 'DS'}</span>
          </div>
          <div>
            <p className="font-semibold">{user?.name ?? 'DevSync User'}</p>
            <p className="text-sm text-muted-foreground">{user?.email ?? ''}</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email ?? ''} disabled className="opacity-60" />
          </div>
        </div>

        {profileMsg && (
          <p className={cn('text-[13px] font-medium', profileMsg.ok ? 'text-[#34C759]' : 'text-destructive')}>
            {profileMsg.ok && <Check className="inline h-3.5 w-3.5 mr-1" />}
            {profileMsg.text}
          </p>
        )}

        <Button type="submit" size="sm" disabled={savingProfile || !name.trim()}>
          {savingProfile ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
          Save Changes
        </Button>
      </form>

      {/* Appearance */}
      <div className="rounded-xl border bg-card p-6 space-y-5">
        <h2 className="font-semibold text-[16px]">Appearance</h2>
        <div className="grid grid-cols-3 gap-3">
          {themes.map(t => (
            <button
              key={t.value}
              onClick={() => setTheme(t.value)}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
                theme === t.value
                  ? 'border-[#007AFF] bg-[#007AFF]/5'
                  : 'border-transparent bg-secondary hover:border-border',
              )}
            >
              <t.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Change Password */}
      <form onSubmit={handleChangePassword} className="rounded-xl border bg-card p-6 space-y-5">
        <h2 className="font-semibold text-[16px]">Change Password</h2>
        <div className="space-y-3 max-w-sm">
          <div className="space-y-2">
            <Label>Current Password</Label>
            <div className="relative">
              <Input
                type={showCur ? 'text' : 'password'}
                value={currentPw}
                onChange={e => setCurrentPw(e.target.value)}
                placeholder="Enter current password"
                className="pr-10"
              />
              <button type="button" onClick={() => setShowCur(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showCur ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>New Password</Label>
            <div className="relative">
              <Input
                type={showNew ? 'text' : 'password'}
                value={newPw}
                onChange={e => setNewPw(e.target.value)}
                placeholder="At least 6 characters"
                className="pr-10"
              />
              <button type="button" onClick={() => setShowNew(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {pwMsg && (
          <p className={cn('text-[13px] font-medium', pwMsg.ok ? 'text-[#34C759]' : 'text-destructive')}>
            {pwMsg.ok && <Check className="inline h-3.5 w-3.5 mr-1" />}
            {pwMsg.text}
          </p>
        )}

        <Button type="submit" size="sm" variant="outline" disabled={savingPw || !currentPw || !newPw}>
          {savingPw ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
          Change Password
        </Button>
      </form>

      {/* Account actions */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="font-semibold text-[16px]">Account</h2>
        <Button
          variant="outline" size="sm"
          className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </Button>
      </div>
    </div>
  );
}
