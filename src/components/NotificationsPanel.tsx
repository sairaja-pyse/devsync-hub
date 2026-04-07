import { useState, useEffect, useCallback } from 'react';
import { Bell, X, CheckCheck, Trash2, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  getNotifications, markAllRead, deleteNotification,
  clearAllNotifications, unreadCount,
  type AppNotification,
} from '@/lib/notificationStorage';

const typeIcon: Record<AppNotification['type'], React.ElementType> = {
  info:    Info,
  success: CheckCircle,
  warning: AlertTriangle,
};

const typeColor: Record<AppNotification['type'], string> = {
  info:    '#007AFF',
  success: '#34C759',
  warning: '#FF9500',
};

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onUnreadChange: (count: number) => void;
}

export function NotificationsPanel({ open, onOpenChange, onUnreadChange }: Props) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const refresh = useCallback(() => {
    const list = getNotifications();
    setNotifications(list);
    onUnreadChange(list.filter(n => !n.read).length);
  }, [onUnreadChange]);

  useEffect(() => { refresh(); }, [open, refresh]);

  const handleMarkAll = () => { markAllRead(); refresh(); };
  const handleDelete  = (id: string) => { deleteNotification(id); refresh(); };
  const handleClear   = () => { clearAllNotifications(); refresh(); };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-sm p-0 flex flex-col">
        <SheetHeader className="px-5 pt-5 pb-4 border-b shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-[18px] font-bold"
              style={{ fontFamily: '-apple-system, "SF Pro Display", sans-serif' }}>
              Notifications
            </SheetTitle>
            <div className="flex items-center gap-1">
              {notifications.some(n => !n.read) && (
                <Button variant="ghost" size="sm" onClick={handleMarkAll}
                  className="h-7 px-2 text-[12px] text-[#007AFF] hover:bg-[#007AFF]/10 rounded-lg gap-1">
                  <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button variant="ghost" size="icon" onClick={handleClear}
                  className="h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  title="Clear all">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3 px-6 text-center">
              <div className="h-14 w-14 squircle-md flex items-center justify-center"
                style={{ background: 'rgba(0,122,255,0.08)' }}>
                <Bell className="h-7 w-7 text-[#007AFF]/40" strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-semibold text-[15px]">No notifications</p>
                <p className="text-[13px] text-muted-foreground mt-0.5">You're all caught up!</p>
              </div>
            </div>
          ) : (
            <div>
              {notifications.map(n => {
                const Icon  = typeIcon[n.type];
                const color = typeColor[n.type];
                return (
                  <div key={n.id}
                    className={cn(
                      'group flex items-start gap-3.5 px-5 py-4 border-b border-border/50 last:border-0 transition-colors',
                      !n.read && 'bg-[#007AFF]/[0.03] dark:bg-[#0A84FF]/[0.05]',
                    )}>
                    <div className="h-9 w-9 squircle-xs flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: `${color}18` }}>
                      <Icon className="h-4.5 w-4.5" style={{ color }} strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn('text-[14px] font-semibold leading-snug',
                          !n.read && 'text-foreground', n.read && 'text-foreground/80')}>
                          {n.title}
                        </p>
                        <div className="flex items-center gap-1 shrink-0">
                          {!n.read && (
                            <div className="h-2 w-2 rounded-full mt-1"
                              style={{ background: '#007AFF' }} />
                          )}
                          <button onClick={() => handleDelete(n.id)}
                            className="hidden group-hover:flex h-5 w-5 items-center justify-center rounded-md text-muted-foreground/50 hover:text-destructive transition-all">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <p className="text-[12px] text-muted-foreground mt-0.5 leading-relaxed">
                        {n.message}
                      </p>
                      <p className="text-[11px] text-muted-foreground/50 mt-1.5">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export { unreadCount };
