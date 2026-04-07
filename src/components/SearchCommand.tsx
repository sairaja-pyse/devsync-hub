import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput,
  CommandItem, CommandList, CommandSeparator,
} from '@/components/ui/command';
import {
  LayoutDashboard, FolderKanban, Kanban, Target,
  Sparkles, Briefcase, Calendar, Settings, BookOpen,
  StickyNote,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard',     path: '/dashboard', icon: LayoutDashboard },
  { label: 'Projects',      path: '/projects',  icon: FolderKanban },
  { label: 'Board',         path: '/board',     icon: Kanban },
  { label: 'Goals',         path: '/goals',     icon: Target },
  { label: 'Skills',        path: '/skills',    icon: Sparkles },
  { label: 'Job Tracker',   path: '/jobs',      icon: Briefcase },
  { label: 'Calendar',      path: '/calendar',  icon: Calendar },
  { label: 'Notes',         path: '/notes',     icon: StickyNote },
  { label: 'Resource Vault',path: '/vault',     icon: BookOpen },
  { label: 'Settings',      path: '/settings',  icon: Settings },
];

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function SearchCommand({ open, onOpenChange }: Props) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  // Cmd+K / Ctrl+K global shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenChange(true);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onOpenChange]);

  const go = useCallback((path: string) => {
    navigate(path);
    onOpenChange(false);
    setQuery('');
  }, [navigate, onOpenChange]);

  const filtered = query.trim()
    ? NAV_ITEMS.filter(i => i.label.toLowerCase().includes(query.toLowerCase()))
    : NAV_ITEMS;

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search pages, features…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          {filtered.map(item => (
            <CommandItem key={item.path} value={item.label} onSelect={() => go(item.path)}>
              <item.icon className="mr-2 h-4 w-4 text-muted-foreground" />
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Quick Actions">
          <CommandItem value="new project" onSelect={() => go('/projects')}>
            <FolderKanban className="mr-2 h-4 w-4 text-muted-foreground" />
            New Project
          </CommandItem>
          <CommandItem value="new note" onSelect={() => go('/notes')}>
            <StickyNote className="mr-2 h-4 w-4 text-muted-foreground" />
            New Note
          </CommandItem>
          <CommandItem value="add goal" onSelect={() => go('/goals')}>
            <Target className="mr-2 h-4 w-4 text-muted-foreground" />
            Add Goal
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
