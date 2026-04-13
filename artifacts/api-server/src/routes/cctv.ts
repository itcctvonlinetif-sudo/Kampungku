import { Router } from "express";
import { db, cctvCamerasTable } from "@workspace/db";
import { requireAuth } from "../lib/auth-middleware";

const router = Router();

router.get("/cctv/cameras", async (req, res) => {
  try {
    const { asc, eq } = await import("drizzle-orm");
    const cameras = await db.select().from(cctvCamerasTable).where(eq(cctvCamerasTable.isActive, true)).orderBy(asc(cctvCamerasTable.sortOrder));
    res.json(cameras);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/cctv/cameras", requireAuth, async (req, res) => {
  try {
    const [camera] = await db.insert(cctvCamerasTable).values(req.body).returning();
    res.status(201).json(camera);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/cctv/cameras/:id", requireAuth, async (req, res) => {
  try {
    const { eq } = await import("drizzle-orm");
    const [updated] = await db.update(cctvCamerasTable)
      .set(req.body)
      .where(eq(cctvCamerasTable.id, parseInt(req.params.id)))
      .returning();
    res.json(updated);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/cctv/cameras/:id", requireAuth, async (req, res) => {
  try {
    const { eq } = await import("drizzle-orm");
    await db.delete(cctvCamerasTable).where(eq(cctvCamerasTable.id, parseInt(req.params.id)));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
