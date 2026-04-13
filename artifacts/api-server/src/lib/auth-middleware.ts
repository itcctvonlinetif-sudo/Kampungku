import type { Request, Response, NextFunction } from "express";
import { validateSession } from "./session";

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.["admin_session"] || req.headers["x-session-token"];
  if (!token || typeof token !== "string") {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const session = validateSession(token);
  if (!session) {
    res.status(401).json({ error: "Session expired or invalid" });
    return;
  }
  (req as Request & { adminUsername: string }).adminUsername = session.username;
  next();
}
