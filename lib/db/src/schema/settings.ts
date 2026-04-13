import { pgTable, serial, text, jsonb, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const homepageSettingsTable = pgTable("homepage_settings", {
  id: serial("id").primaryKey(),
  heroTitle: text("hero_title").notNull().default("Selamat Datang di Kampungku"),
  heroSubtitle: text("hero_subtitle").notNull().default("Perumahan nyaman dan asri untuk keluarga Anda"),
  heroImageUrl: text("hero_image_url").default(""),
  heroBanners: jsonb("hero_banners").$type<string[]>().default([]),
  aboutTitle: text("about_title").default("Tentang Kampungku"),
  aboutText: text("about_text").default("Kampungku adalah perumahan modern yang mengutamakan kenyamanan, keamanan, dan keharmonisan warga."),
  aboutImageUrl: text("about_image_url").default(""),
  featuresTitle: text("features_title").default("Fasilitas Unggulan"),
  features: jsonb("features").$type<Array<{ icon: string; title: string; description: string }>>().default([]),
  statsItems: jsonb("stats_items").$type<Array<{ value: string; label: string }>>().default([]),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertHomepageSettingsSchema = createInsertSchema(homepageSettingsTable).omit({ id: true, updatedAt: true });
export type InsertHomepageSettings = z.infer<typeof insertHomepageSettingsSchema>;
export type HomepageSettings = typeof homepageSettingsTable.$inferSelect;

export const contactSettingsTable = pgTable("contact_settings", {
  id: serial("id").primaryKey(),
  address: text("address").notNull().default("Jl. Kampungku No. 1, Indonesia"),
  phone: text("phone").default("+62 21 1234 5678"),
  email: text("email").default("info@kampungku.id"),
  mapEmbedUrl: text("map_embed_url").default(""),
  mapLat: doublePrecision("map_lat").default(-6.2088),
  mapLng: doublePrecision("map_lng").default(106.8456),
  officeHours: text("office_hours").default("Senin - Jumat: 08.00 - 17.00"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertContactSettingsSchema = createInsertSchema(contactSettingsTable).omit({ id: true, updatedAt: true });
export type InsertContactSettings = z.infer<typeof insertContactSettingsSchema>;
export type ContactSettings = typeof contactSettingsTable.$inferSelect;

export const emailSettingsTable = pgTable("email_settings", {
  id: serial("id").primaryKey(),
  gmailUser: text("gmail_user").default(""),
  gmailAppPassword: text("gmail_app_password").default(""),
  recipientEmail: text("recipient_email").default(""),
  senderName: text("sender_name").default("Kampungku"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertEmailSettingsSchema = createInsertSchema(emailSettingsTable).omit({ id: true, updatedAt: true });
export type InsertEmailSettings = z.infer<typeof insertEmailSettingsSchema>;
export type EmailSettings = typeof emailSettingsTable.$inferSelect;

export const driveSettingsTable = pgTable("drive_settings", {
  id: serial("id").primaryKey(),
  appsScriptUrl: text("apps_script_url").default(""),
  folderId: text("folder_id").default(""),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertDriveSettingsSchema = createInsertSchema(driveSettingsTable).omit({ id: true, updatedAt: true });
export type InsertDriveSettings = z.infer<typeof insertDriveSettingsSchema>;
export type DriveSettings = typeof driveSettingsTable.$inferSelect;

export const cctvSettingsTable = pgTable("cctv_settings", {
  id: serial("id").primaryKey(),
  pagePassword: text("page_password").notNull().default("kampungku123"),
  pageTitle: text("page_title").default("Pantau CCTV"),
  pageDescription: text("page_description").default("Pantau kondisi lingkungan perumahan secara langsung"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCctvSettingsSchema = createInsertSchema(cctvSettingsTable).omit({ id: true, updatedAt: true });
export type InsertCctvSettings = z.infer<typeof insertCctvSettingsSchema>;
export type CctvSettings = typeof cctvSettingsTable.$inferSelect;

export const documentsPageSettingsTable = pgTable("documents_page_settings", {
  id: serial("id").primaryKey(),
  pageTitle: text("page_title").default("Dokumen & Informasi"),
  pageDescription: text("page_description").default("Unduh dokumen dan informasi penting terkait perumahan Kampungku"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertDocumentsPageSettingsSchema = createInsertSchema(documentsPageSettingsTable).omit({ id: true, updatedAt: true });
export type InsertDocumentsPageSettings = z.infer<typeof insertDocumentsPageSettingsSchema>;
export type DocumentsPageSettings = typeof documentsPageSettingsTable.$inferSelect;

export const adminCredentialsTable = pgTable("admin_credentials", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().default("admin"),
  passwordHash: text("password_hash").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
