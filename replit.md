# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Project: Kampungku - Website Perumahan

Housing estate website inspired by grandwisata.net. Full CMS admin portal.

### Default Credentials
- **Admin login**: username `admin`, password `admin123`
- **CCTV page password**: `kampungku123`

### Public Pages
- `/` — Beranda (homepage)
- `/galeri` — Gallery of photos and videos
- `/cctv` — CCTV viewer (password protected)
- `/dokumen` — Document downloads
- `/kontak` — Contact form + Google Maps
- `/halaman/:slug` — Custom pages (dynamically created via admin)

### Admin Panel Routes
- `/admin` — Dashboard
- `/admin/beranda` — Homepage settings (hero, about, features with imageUrl)
- `/admin/galeri` — Gallery management (photos + videos, YouTube/Drive/direct URL)
- `/admin/cctv` — CCTV camera management
- `/admin/dokumen` — Document management
- `/admin/halaman` — **Custom pages** (create, edit, delete, publish, show-in-nav toggle)
- `/admin/kontak` — Contact settings + incoming messages
- `/admin/email` — Gmail App Password settings (nodemailer)
- `/admin/drive` — Google Apps Script Drive upload settings
- `/admin/password` — Change admin password

### Database Tables
- `settings` — key/value config (homepage, contact, email, drive, cctv password)
- `gallery_images` — photo gallery
- `gallery_videos` — video gallery (YouTube/Drive/direct)
- `documents` — downloadable files
- `contact_messages` — incoming contact form submissions
- `cctv_cameras` — CCTV camera URLs
- `custom_pages` — custom public pages (slug, title, HTML content, published/nav toggle)

### Key Technical Notes
- Video embed utility: `getVideoEmbedInfo(url)` in `utils.ts` detects YouTube/Drive/direct video
- Google Drive images: use `https://drive.google.com/thumbnail?id=FILE_ID&sz=w1000`
- DriveUpload component sends base64-encoded file to Apps Script URL
- Feature objects in homepage settings have shape `{ icon, title, description, imageUrl }`
- Session cookie: `admin_session` (httpOnly, 24h TTL)
- Auth middleware: `artifacts/api-server/src/lib/auth-middleware.ts`
