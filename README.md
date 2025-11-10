# Nuxt DynQR

Generate, brand, and manage short QR links with a modern Nuxt 4 UI. Nuxt DynQR lets users create short slugs that redirect to external URLs, customize and download QR codes (PNG/SVG), and optionally apply organization branding. Admins can manage all links and upload brand images.

Features
- Nuxt 4 + @nuxt/ui dashboard shell (mobile friendly)
- QR generation with styling and center image overlays
- Short redirect route `/l/:slug` with visit counts
- Per‑user link ownership (YunoHost SSO/LDAP friendly)
- Admin features: list all links, toggle active, delete, manage brand images and default colors
- MariaDB via Prisma ORM with migrations

Quick Start
1) Install dependencies
```bash
# choose your package manager
bun install   # or: npm install / pnpm install / bun install
```

2) Configure environment
Create a `.env` file with at least:
```
DATABASE_URL="mysql://USER:PASS@HOST:3306/DBNAME"  # MariaDB/MySQL
# Optional LDAP + local dev SSO emulation
LDAP_URL="ldap://127.0.0.1:10389"
EMULATE_SSOWAT="true"              # only for local dev
EMULATE_SSOWAT_UID="devuser"       # only for local dev
EMULATE_SSOWAT_PWD="devpassword"   # only for local dev
```

3) Prepare database (Prisma)
```bash
bun prisma:generate
bun db:migrate     # create/apply dev migrations
# or in production:
bun db:deploy      # apply existing migrations
```

4) Run the app
```bash
bun dev            # http://localhost:3000
```

Build & Preview
```bash
bun build
bun preview        # production preview
```

Configuration
- Modules: `@nuxt/ui`, `@nuxt/image`, `@nuxtjs/i18n`
- Styling: @nuxt/ui theme (see `app/app.config.ts`)
- i18n: English/French in `i18n/locales`
- Database: Prisma models in `prisma/schema.prisma` (tables prefixed `dqr_`)

Authentication & Roles
- Requests behind YunoHost SSO should include `YNH_USER` (set by SSOwat) and `Authorization: Basic ...` for LDAP (checked server-side) to resolve user role: `admin` or `user`.
- For local development, you can emulate headers using `server/middleware/emulate-ssowat.ts` with `EMULATE_SSOWAT=true` and the UID/PWD env vars above.

Key Routes
- Web
  - `/` – My links
  - `/generate` – Create new link
  - `/qr/:slug` – Manage a specific link and generate QR codes
  - `/admin` – Admin dashboard

- API (user scope)
  - `GET /api/links` – List my links
  - `POST /api/links` – Create a link `{ url, [slug], [title] }`
  - `GET /api/links/:slug` – Get a link (owner or admin)
  - `PATCH /api/links/:slug` – Update `{ url?, title?, isActive? }` (owner or admin)
  - `DELETE /api/links/:slug` – Delete (owner or admin)

- API (admin)
  - `GET /api/admin/links` – List all
  - `PATCH /api/admin/links/:id` – Update (slug, url, isActive, ownerUsername, title)
  - `DELETE /api/admin/links/:id` – Delete
  - `GET /api/admin/brand` – Get current brand
  - `POST /api/admin/brand` – Set brand with image (multipart form)
  - `PATCH /api/admin/brand` – Update name/fgColor/bgColor
  - `DELETE /api/admin/brand` – Remove brand and logo
  - `GET /api/admin/brand/images` – List brand images
  - `POST /api/admin/brand/images` – Upload images (multipart form)
  - `DELETE /api/admin/brand/images/:id` – Delete one image

- Redirect
  - `GET /l/:slug` – 302 redirect to the target URL (increments visit count)

Security Notes
- URLs are sanitized server‑side to allow only absolute http(s) links and reject CR/LF before storage and on redirect.
- If deploying outside of YunoHost/SSOwat, ensure you enforce proper auth on headers and add CSRF protection for state‑changing routes.
- File uploads are restricted to `public/uploads/brands/`; consider adding size/type limits and serving files via a media proxy in production.

Development Tips
- UI colors can be tweaked in `app/app.config.ts`.
- Sidebar navigation pulls your links and admin status on mount.
- Translations in `i18n/locales/en.json` and `i18n/locales/fr.json`.

Prisma Cheatsheet
```bash
bun prisma:generate   # regenerate client
bun db:migrate        # dev migration
bun db:deploy         # apply in prod/CI
bun db:studio         # web UI
```

Contributing
- Issues and PRs welcome. Please follow the existing code style and keep changes focused.

License
- AGPL-3.0 License

