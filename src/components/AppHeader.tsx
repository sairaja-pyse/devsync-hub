import { useState } from 'react';
import { Menu, Bell, Search, LogOut, Settings, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationsPanel } from './NotificationsPanel';
import { SearchCommand } from './SearchCommand';

interface AppHeaderProps {
  onMenuToggle: () => void;
}

export function AppHeader({ onMenuToggle }: AppHeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [notifOpen,  setNotifOpen]  = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [unread,     setUnread]     = useState(0);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <header className="sticky top-0 z-30 h-[52px] flex items-center px-4 gap-3 apple-navbar">
        <Button
          variant="ghost" size="icon"
          className="lg:hidden h-9 w-9 rounded-xl"
          onClick={onMenuToggle}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Search bar — desktop */}
        <div className="flex-1 flex items-center gap-3">
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden sm:flex relative max-w-sm flex-1 items-center h-9 rounded-[10px] px-3 gap-2 text-left transition-all"
            style={{ background: 'rgba(118,118,128,0.12)' }}
          >
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-[14px] text-muted-foreground flex-1">Search…</span>
            <span className="hidden md:inline text-[11px] text-muted-foreground/50 font-mono bg-muted/60 px-1.5 py-0.5 rounded-md">
              ⌘K
            </span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          {/* Mobile search */}
          <Button
            variant="ghost" size="icon"
            className="h-9 w-9 rounded-xl sm:hidden"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Bell */}
          <Button
            variant="ghost" size="icon"
            className="h-9 w-9 rounded-xl relative"
            onClick={() => setNotifOpen(true)}
          >
            <Bell className="h-4 w-4" />
            {unread > 0 && (
              <span
                className="absolute top-1.5 right-1.5 h-[9px] w-[9px] rounded-full ring-[1.5px] ring-background"
                style={{ background: '#FF3B30' }}
              />
            )}
          </Button>

          <ThemeToggle />

          {/* Profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar
                className="h-[30px] w-[30px] ml-0.5 cursor-pointer transition-transform active:scale-95"
                style={{ boxShadow: '0 0 0 2px rgba(0,122,255,0.25)' }}
              >
                <AvatarFallback
                  className="text-white text-[11px] font-bold"
                  style={{ background: 'linear-gradient(145deg, #409CFF, #007AFF)' }}
                >
                  {user?.initials ?? 'DS'}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 rounded-xl">
              <DropdownMenuLabel className="font-normal pb-2">
                <p className="font-semibold text-[14px] truncate">{user?.name ?? 'DevSync User'}</p>
                <p className="text-[12px] text-muted-foreground truncate">{user?.email ?? ''}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/settings')} className="gap-2 rounded-lg">
                <User className="h-4 w-4" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')} className="gap-2 rounded-lg">
                <Settings className="h-4 w-4" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="gap-2 rounded-lg text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <NotificationsPanel
        open={notifOpen}
        onOpenChange={setNotifOpen}
        onUnreadChange={setUnread}
      />

      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
