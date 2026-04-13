import { Router } from "express";
import { db, galleryItemsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../lib/auth-middleware";

const router = Router();

router.get("/gallery/images", async (req, res) => {
  try {
    const { eq } = await import("drizzle-orm");
    const items = await db.select().from(galleryItemsTable).where(eq(galleryItemsTable.type, "image")).orderBy(galleryItemsTable.createdAt);
    res.json(items);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/gallery/images", requireAuth, async (req, res) => {
  try {
    const [item] = await db.insert(galleryItemsTable).values({ ...req.body, type: "image" }).returning();
    res.status(201).json(item);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/gallery/images/:id", requireAuth, async (req, res) => {
  try {
    const { eq } = await import("drizzle-orm");
    await db.delete(galleryItemsTable).where(eq(galleryItemsTable.id, parseInt(req.params.id)));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/gallery/videos", async (req, res) => {
  try {
    const { eq } = await import("drizzle-orm");
    const items = await db.select().from(galleryItemsTable).where(eq(galleryItemsTable.type, "video")).orderBy(galleryItemsTable.createdAt);
    res.json(items);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/gallery/videos", requireAuth, async (req, res) => {
  try {
    const [item] = await db.insert(galleryItemsTable).values({ ...req.body, type: "video" }).returning();
    res.status(201).json(item);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/gallery/videos/:id", requireAuth, async (req, res) => {
  try {
    const { eq } = await import("drizzle-orm");
    await db.delete(galleryItemsTable).where(eq(galleryItemsTable.id, parseInt(req.params.id)));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
