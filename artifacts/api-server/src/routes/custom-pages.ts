import { Router } from "express";
import { db, customPagesTable } from "@workspace/db";
import { requireAuth } from "../lib/auth-middleware";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/custom-pages", async (req, res) => {
  try {
    const pages = await db.select().from(customPagesTable).orderBy(customPagesTable.sortOrder);
    res.json(pages);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/custom-pages/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const [page] = await db.select().from(customPagesTable).where(eq(customPagesTable.slug, slug)).limit(1);
    if (!page) {
      res.status(404).json({ error: "Halaman tidak ditemukan" });
      return;
    }
    res.json(page);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/custom-pages", requireAuth, async (req, res) => {
  try {
    const body = req.body as { title: string; slug: string; content?: string; isPublished?: boolean; showInNav?: boolean; sortOrder?: number };
    if (!body.title || !body.slug) {
      res.status(400).json({ error: "Title dan slug wajib diisi" });
      return;
    }
    const slug = body.slug.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/--+/g, "-");
    const [page] = await db.insert(customPagesTable).values({ ...body, slug }).returning();
    res.status(201).json(page);
  } catch (err: any) {
    if (err.code === "23505") {
      res.status(400).json({ error: "Slug sudah digunakan. Gunakan slug yang lain." });
      return;
    }
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/custom-pages/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const body = req.body;
    if (body.slug) {
      body.slug = body.slug.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/--+/g, "-");
    }
    const [updated] = await db.update(customPagesTable)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(customPagesTable.id, id))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Halaman tidak ditemukan" });
      return;
    }
    res.json(updated);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/custom-pages/:id", requireAuth, async (req, res) => {
  try {
    await db.delete(customPagesTable).where(eq(customPagesTable.id, parseInt(req.params.id)));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
