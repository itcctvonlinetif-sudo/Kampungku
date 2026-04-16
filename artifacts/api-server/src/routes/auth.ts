import { Router } from "express";
import { db } from "@workspace/db";
import { adminCredentialsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { createSession, destroySession, validateSession } from "../lib/session";
import { requireAuth } from "../lib/auth-middleware";

const router = Router();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "kampungku_salt").digest("hex");
}

async function ensureAdminExists() {
  const existing = await db.select().from(adminCredentialsTable).limit(1);
  if (existing.length === 0) {
    await db.insert(adminCredentialsTable).values({
      username: "admin",
      passwordHash: null,
    });
  }
}

router.post("/auth/admin/login", async (req, res) => {
  try {
    await ensureAdminExists();
    const { username, password } = req.body as { username: string; password: string };
    if (!username) {
      res.status(400).json({ success: false, message: "Username wajib diisi" });
      return;
    }
    const [admin] = await db.select().from(adminCredentialsTable).where(eq(adminCredentialsTable.username, username)).limit(1);
    if (!admin) {
      res.status(401).json({ success: false, message: "Username tidak ditemukan" });
      return;
    }

    const needsPasswordSetup = !admin.passwordHash;

    if (!needsPasswordSetup && admin.passwordHash !== hashPassword(password || "")) {
      res.status(401).json({ success: false, message: "Username atau password salah" });
      return;
    }

    const token = createSession(username);
    res.cookie("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.json({ success: true, message: "Login berhasil", needsPasswordSetup });
  } catch (err) {
    req.log.error({ err }, "Login error");
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.post("/auth/admin/logout", (req, res) => {
  const token = req.cookies?.["admin_session"];
  if (token) destroySession(token);
  res.clearCookie("admin_session");
  res.json({ success: true });
});

router.get("/auth/admin/me", async (req, res) => {
  const token = req.cookies?.["admin_session"] || req.headers["x-session-token"];
  if (!token || typeof token !== "string") {
    res.json({ isAuthenticated: false });
    return;
  }
  const session = validateSession(token);
  if (!session) {
    res.json({ isAuthenticated: false });
    return;
  }
  try {
    const [admin] = await db.select().from(adminCredentialsTable).where(eq(adminCredentialsTable.username, session.username)).limit(1);
    const needsPasswordSetup = !admin?.passwordHash;
    res.json({ isAuthenticated: true, username: session.username, needsPasswordSetup });
  } catch {
    res.json({ isAuthenticated: true, username: session.username, needsPasswordSetup: false });
  }
});

router.post("/auth/admin/change-password", requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body as { currentPassword?: string; newPassword: string };
    const adminReq = req as typeof req & { adminUsername: string };
    const [admin] = await db.select().from(adminCredentialsTable).where(eq(adminCredentialsTable.username, adminReq.adminUsername)).limit(1);
    if (!admin) {
      res.status(404).json({ error: "Admin tidak ditemukan" });
      return;
    }

    const isFirstSetup = !admin.passwordHash;

    if (!isFirstSetup) {
      if (!currentPassword || admin.passwordHash !== hashPassword(currentPassword)) {
        res.status(401).json({ error: "Password lama salah" });
        return;
      }
    }

    await db.update(adminCredentialsTable)
      .set({ passwordHash: hashPassword(newPassword), updatedAt: new Date() })
      .where(eq(adminCredentialsTable.username, adminReq.adminUsername));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Change password error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/cctv/verify", async (req, res) => {
  try {
    const { password } = req.body as { password: string };
    const { cctvSettingsTable } = await import("@workspace/db");
    const [settings] = await db.select().from(cctvSettingsTable).limit(1);
    const correctPassword = settings?.pagePassword || "kampungku123";
    if (password === correctPassword) {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false });
    }
  } catch (err) {
    req.log.error({ err }, "CCTV verify error");
    res.status(500).json({ success: false });
  }
});

export default router;
