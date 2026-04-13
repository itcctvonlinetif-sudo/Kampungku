import crypto from "crypto";

const sessions = new Map<string, { username: string; createdAt: number }>();
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

export function createSession(username: string): string {
  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, { username, createdAt: Date.now() });
  return token;
}

export function validateSession(token: string): { username: string } | null {
  const session = sessions.get(token);
  if (!session) return null;
  if (Date.now() - session.createdAt > SESSION_TTL_MS) {
    sessions.delete(token);
    return null;
  }
  return { username: session.username };
}

export function destroySession(token: string): void {
  sessions.delete(token);
}

export function cleanExpiredSessions(): void {
  const now = Date.now();
  for (const [token, session] of sessions.entries()) {
    if (now - session.createdAt > SESSION_TTL_MS) {
      sessions.delete(token);
    }
  }
}
