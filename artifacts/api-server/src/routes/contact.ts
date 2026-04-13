import { Router } from "express";
import { db, contactMessagesTable, emailSettingsTable } from "@workspace/db";
import { requireAuth } from "../lib/auth-middleware";
import nodemailer from "nodemailer";

const router = Router();

router.get("/contact/messages", requireAuth, async (req, res) => {
  try {
    const { desc } = await import("drizzle-orm");
    const messages = await db.select().from(contactMessagesTable).orderBy(desc(contactMessagesTable.createdAt));
    res.json(messages);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/contact/messages", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body as {
      name: string;
      email: string;
      phone?: string;
      subject?: string;
      message: string;
    };

    const [saved] = await db.insert(contactMessagesTable).values({
      name,
      email,
      phone: phone || "",
      subject: subject || "",
      message,
    }).returning();

    const emailRows = await db.select().from(emailSettingsTable).limit(1);
    const emailSettings = emailRows[0];

    if (emailSettings?.gmailUser && emailSettings?.gmailAppPassword && emailSettings?.recipientEmail) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: emailSettings.gmailUser,
            pass: emailSettings.gmailAppPassword,
          },
        });
        await transporter.sendMail({
          from: `"${emailSettings.senderName || "Kampungku"}" <${emailSettings.gmailUser}>`,
          to: emailSettings.recipientEmail,
          subject: `Pesan Kontak Baru: ${subject || "Tanpa Subjek"} - dari ${name}`,
          html: `
            <h2>Pesan Kontak Baru dari Website Kampungku</h2>
            <p><strong>Nama:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Telepon:</strong> ${phone || "-"}</p>
            <p><strong>Subjek:</strong> ${subject || "-"}</p>
            <p><strong>Pesan:</strong></p>
            <p>${message.replace(/\n/g, "<br>")}</p>
          `,
        });
      } catch (emailErr) {
        req.log.warn({ emailErr }, "Failed to send notification email");
      }
    }

    res.status(201).json(saved);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/contact/messages/:id", requireAuth, async (req, res) => {
  try {
    const { eq } = await import("drizzle-orm");
    await db.delete(contactMessagesTable).where(eq(contactMessagesTable.id, parseInt(req.params.id)));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
