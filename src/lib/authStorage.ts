export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
}

const USERS_KEY   = 'devsync_users_v1';
const SESSION_KEY = 'devsync_session_v1';

function hashPassword(password: string): string {
  // Client-side hash (no backend). In a real app, use bcrypt server-side.
  const salt = 'devsync_s@lt_2025';
  const str  = password + salt;
  let h = 0xdeadbeef;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 0x9e3779b9);
    h ^= h >>> 16;
  }
  return (h >>> 0).toString(16).padStart(8, '0') + str.length.toString(36);
}

function getUsers(): StoredUser[] {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]'); }
  catch { return []; }
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getSession(): SessionUser | null {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null'); }
  catch { return null; }
}

export function setSession(user: SessionUser) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function authSignUp(
  name: string, email: string, password: string,
): { ok: boolean; error?: string } {
  const users = getUsers();
  if (users.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
    return { ok: false, error: 'An account with this email already exists.' };
  }
  const user: StoredUser = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };
  saveUsers([...users, user]);
  return { ok: true };
}

export function authSignIn(
  email: string, password: string,
): { ok: boolean; user?: SessionUser; error?: string } {
  const users = getUsers();
  const found = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!found) return { ok: false, error: 'No account found with this email.' };
  if (found.passwordHash !== hashPassword(password)) {
    return { ok: false, error: 'Incorrect password.' };
  }
  const session: SessionUser = { id: found.id, name: found.name, email: found.email };
  setSession(session);
  return { ok: true, user: session };
}

export function authUpdateProfile(
  id: string, name: string, email: string,
): { ok: boolean; error?: string } {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === id);
  if (idx < 0) return { ok: false, error: 'User not found.' };
  if (users.some(u => u.id !== id && u.email.toLowerCase() === email.toLowerCase())) {
    return { ok: false, error: 'This email is already in use.' };
  }
  users[idx] = { ...users[idx], name: name.trim(), email: email.trim().toLowerCase() };
  saveUsers(users);
  setSession({ id, name: name.trim(), email: email.trim().toLowerCase() });
  return { ok: true };
}

export function authChangePassword(
  id: string, current: string, next: string,
): { ok: boolean; error?: string } {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === id);
  if (idx < 0) return { ok: false, error: 'User not found.' };
  if (users[idx].passwordHash !== hashPassword(current)) {
    return { ok: false, error: 'Current password is incorrect.' };
  }
  users[idx] = { ...users[idx], passwordHash: hashPassword(next) };
  saveUsers(users);
  return { ok: true };
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
