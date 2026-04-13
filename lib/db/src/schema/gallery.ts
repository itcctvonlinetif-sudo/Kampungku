import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const galleryItemsTable = pgTable("gallery_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url").default(""),
  type: text("type").notNull().default("image"),
  description: text("description").default(""),
  driveFileId: text("drive_file_id").default(""),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertGalleryItemSchema = createInsertSchema(galleryItemsTable).omit({ id: true, createdAt: true });
export type InsertGalleryItem = z.infer<typeof insertGalleryItemSchema>;
export type GalleryItem = typeof galleryItemsTable.$inferSelect;
