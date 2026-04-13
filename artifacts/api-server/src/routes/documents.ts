import { Router } from "express";
import { db, documentsTable } from "@workspace/db";
import { requireAuth } from "../lib/auth-middleware";

const router = Router();

router.get("/documents", async (req, res) => {
  try {
    const docs = await db.select().from(documentsTable).orderBy(documentsTable.createdAt);
    res.json(docs);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/documents", requireAuth, async (req, res) => {
  try {
    const [doc] = await db.insert(documentsTable).values(req.body).returning();
    res.status(201).json(doc);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/documents/:id", requireAuth, async (req, res) => {
  try {
    const { eq } = await import("drizzle-orm");
    await db.delete(documentsTable).where(eq(documentsTable.id, parseInt(req.params.id)));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
