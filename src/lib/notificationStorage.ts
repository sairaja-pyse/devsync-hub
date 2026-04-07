export type NotifType = 'info' | 'success' | 'warning';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotifType;
  read: boolean;
  createdAt: string;
}

const KEY = 'devsync_notifications_v1';

export function getNotifications(): AppNotification[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]'); }
  catch { return []; }
}

function save(list: AppNotification[]) {
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 50)));
}

export function addNotification(
  n: Pick<AppNotification, 'title' | 'message' | 'type'>,
): AppNotification {
  const notif: AppNotification = {
    id: crypto.randomUUID(),
    ...n,
    read: false,
    createdAt: new Date().toISOString(),
  };
  save([notif, ...getNotifications()]);
  return notif;
}

export function markRead(id: string) {
  save(getNotifications().map(n => n.id === id ? { ...n, read: true } : n));
}

export function markAllRead() {
  save(getNotifications().map(n => ({ ...n, read: true })));
}

export function deleteNotification(id: string) {
  save(getNotifications().filter(n => n.id !== id));
}

export function clearAllNotifications() {
  localStorage.removeItem(KEY);
}

export function unreadCount(): number {
  return getNotifications().filter(n => !n.read).length;
}
