import { Router } from "express";
import { db } from "@workspace/db";
import {
  homepageSettingsTable,
  contactSettingsTable,
  emailSettingsTable,
  driveSettingsTable,
  cctvSettingsTable,
  documentsPageSettingsTable,
} from "@workspace/db";
import { requireAuth } from "../lib/auth-middleware";
import nodemailer from "nodemailer";

const router = Router();

async function getOrCreate<T extends { id: number }>(
  table: Parameters<typeof db.select>[0] extends undefined ? never : any,
  defaultValues: Omit<T, "id" | "updatedAt" | "createdAt">
): Promise<T> {
  const rows = await db.select().from(table).limit(1);
  if (rows.length > 0) return rows[0] as T;
  const inserted = await db.insert(table).values(defaultValues as any).returning();
  return inserted[0] as T;
}

router.get("/settings/homepage", async (req, res) => {
  try {
    const rows = await db.select().from(homepageSettingsTable).limit(1);
    if (rows.length > 0) {
      res.json(rows[0]);
      return;
    }
    const [created] = await db.insert(homepageSettingsTable).values({}).returning();
    res.json(created);
  } catch (err) {
    req.log.error({ err }, "Get homepage settings error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/settings/homepage", requireAuth, async (req, res) => {
  try {
    const rows = await db.select().from(homepageSettingsTable).limit(1);
    if (rows.length === 0) {
      await db.insert(homepageSettingsTable).values({});
    }
    const existing = await db.select().from(homepageSettingsTable).limit(1);
    const id = existing[0].id;
    const body = req.body;
    const [updated] = await db.update(homepageSettingsTable)
      .set({ ...body, updatedAt: new Date() })
      .where((t: any) => {
        const { eq } = require("drizzle-orm");
        return eq(t.id, id);
      })
      .returning();
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Update homepage settings error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/settings/contact", async (req, res) => {
  try {
    const rows = await db.select().from(contactSettingsTable).limit(1);
    if (rows.length > 0) {
      res.json(rows[0]);
      return;
    }
    const [created] = await db.insert(contactSettingsTable).values({}).returning();
    res.json(created);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/settings/contact", requireAuth, async (req, res) => {
  try {
    const rows = await db.select().from(contactSettingsTable).limit(1);
    if (rows.length === 0) {
      await db.insert(contactSettingsTable).values({});
    }
    const existing = await db.select().from(contactSettingsTable).limit(1);
    const id = existing[0].id;
    const { eq } = await import("drizzle-orm");
    const [updated] = await db.update(contactSettingsTable)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(contactSettingsTable.id, id))
      .returning();
    res.json(updated);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/settings/email", requireAuth, async (req, res) => {
  try {
    const rows = await db.select().from(emailSettingsTable).limit(1);
    if (rows.length > 0) {
      res.json(rows[0]);
      return;
    }
    const [created] = await db.insert(emailSettingsTable).values({}).returning();
    res.json(created);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/settings/email", requireAuth, async (req, res) => {
  try {
    const rows = await db.select().from(emailSettingsTable).limit(1);
    if (rows.length === 0) {
      await db.insert(emailSettingsTable).values({});
    }
    const existing = await db.select().from(emailSettingsTable).limit(1);
    const id = existing[0].id;
    const { eq } = await import("drizzle-orm");
    const [updated] = await db.update(emailSettingsTable)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(emailSettingsTable.id, id))
      .returning();
    res.json(updated);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/settings/email/test", requireAuth, async (req, res) => {
  try {
    const rows = await db.select().from(emailSettingsTable).limit(1);
    const settings = rows[0];
    if (!settings?.gmailUser || !settings?.gmailAppPassword) {
      res.json({ success: false, message: "Pengaturan email belum lengkap. Harap isi Gmail User dan App Password." });
      return;
    }
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: settings.gmailUser,
        pass: settings.gmailAppPassword,
      },
    });
    await transporter.verify();
    res.json({ success: true, message: "Koneksi email berhasil! Konfigurasi Gmail App Password sudah benar." });
  } catch (err: any) {
    req.log.error({ err }, "Email test error");
    res.json({ success: false, message: `Gagal terhubung: ${err.message}` });
  }
});

router.get("/settings/drive", requireAuth, async (req, res) => {
  try {
    const rows = await db.select().from(driveSettingsTable).limit(1);
    if (rows.length > 0) {
      res.json(rows[0]);
      return;
    }
    const [created] = await db.insert(driveSettingsTable).values({}).returning();
    res.json(created);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/settings/drive", requireAuth, async (req, res) => {
  try {
    const rows = await db.select().from(driveSettingsTable).limit(1);
    if (rows.length === 0) {
      await db.insert(driveSettingsTable).values({});
    }
    const existing = await db.select().from(driveSettingsTable).limit(1);
    const id = existing[0].id;
    const { eq } = await import("drizzle-orm");
    const [updated] = await db.update(driveSettingsTable)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(driveSettingsTable.id, id))
      .returning();
    res.json(updated);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/settings/drive/test", requireAuth, async (req, res) => {
  try {
    const rows = await db.select().from(driveSettingsTable).limit(1);
    const settings = rows[0];
    if (!settings?.appsScriptUrl) {
      res.json({ success: false, message: "URL Apps Script belum diatur." });
      return;
    }
    const response = await fetch(settings.appsScriptUrl + "?test=true", {
      method: "GET",
      signal: AbortSignal.timeout(10000),
    });
    if (response.ok) {
      res.json({ success: true, message: "Koneksi Google Drive Apps Script berhasil!" });
    } else {
      res.json({ success: false, message: `Apps Script merespons dengan status: ${response.status}` });
    }
  } catch (err: any) {
    req.log.error({ err }, "Drive test error");
    res.json({ success: false, message: `Gagal terhubung ke Apps Script: ${err.message}` });
  }
});

router.get("/settings/cctv", async (req, res) => {
  try {
    const rows = await db.select().from(cctvSettingsTable).limit(1);
    if (rows.length > 0) {
      const row = rows[0];
      res.json({ ...row, pagePassword: "***" });
      return;
    }
    const [created] = await db.insert(cctvSettingsTable).values({}).returning();
    res.json({ ...created, pagePassword: "***" });
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/settings/cctv/full", requireAuth, async (req, res) => {
  try {
    const rows = await db.select().from(cctvSettingsTable).limit(1);
    if (rows.length > 0) {
      res.json(rows[0]);
      return;
    }
    const [created] = await db.insert(cctvSettingsTable).values({}).returning();
    res.json(created);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/settings/cctv", requireAuth, async (req, res) => {
  try {
    const rows = await db.select().from(cctvSettingsTable).limit(1);
    if (rows.length === 0) {
      await db.insert(cctvSettingsTable).values({});
    }
    const existing = await db.select().from(cctvSettingsTable).limit(1);
    const id = existing[0].id;
    const { eq } = await import("drizzle-orm");
    const [updated] = await db.update(cctvSettingsTable)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(cctvSettingsTable.id, id))
      .returning();
    res.json(updated);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/settings/documents-page", async (req, res) => {
  try {
    const rows = await db.select().from(documentsPageSettingsTable).limit(1);
    if (rows.length > 0) {
      res.json(rows[0]);
      return;
    }
    const [created] = await db.insert(documentsPageSettingsTable).values({}).returning();
    res.json(created);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/settings/documents-page", requireAuth, async (req, res) => {
  try {
    const rows = await db.select().from(documentsPageSettingsTable).limit(1);
    if (rows.length === 0) {
      await db.insert(documentsPageSettingsTable).values({});
    }
    const existing = await db.select().from(documentsPageSettingsTable).limit(1);
    const id = existing[0].id;
    const { eq } = await import("drizzle-orm");
    const [updated] = await db.update(documentsPageSettingsTable)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(documentsPageSettingsTable.id, id))
      .returning();
    res.json(updated);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
