import { pgTable, serial, text, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const cctvCamerasTable = pgTable("cctv_cameras", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").default(""),
  streamUrl: text("stream_url").notNull(),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCctvCameraSchema = createInsertSchema(cctvCamerasTable).omit({ id: true, createdAt: true });
export type InsertCctvCamera = z.infer<typeof insertCctvCameraSchema>;
export type CctvCamera = typeof cctvCamerasTable.$inferSelect;
