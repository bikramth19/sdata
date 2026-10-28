# Monoline — Student Registration & Administration

A full-stack Next.js application for public student registrations and permission-controlled staff administration, designed around a light gray visual system and a two-column login screen.

## Stack

- **Node.js 22.23.2** (`.nvmrc`, `package.json` engines)
- **Next.js App Router 15** + TypeScript + React 19
- **Prisma ORM 6** and MySQL
- `bcryptjs` password hashing, signed HTTP-only `jose` session cookies
- `recharts` analytics, `exceljs` Excel export, `pdf-lib` printable PDFs
- Custom responsive CSS with light and dark modes (no Tailwind installation needed)

## Getting started

> Install Node.js **22.23.2** using `nvm install 22.23.2 && nvm use` or your preferred Node version manager.

```bash
cd monoline-student-registration
cp .env.example .env
```

Edit `.env` and set:

- `SESSION_SECRET` to a randomly generated secret for signing JWT session cookies (at least 32 characters; run `openssl rand -base64 48`).
- `ADMIN_EMAIL` to the initial administrator email.
- `ADMIN_PASSWORD` to a strong password of **12 characters or more**. Do not leave the example password.
- `DATABASE_URL` to a MySQL connection string, for example `mysql://USER:PASSWORD@127.0.0.1:3306/monoline`.

Then run:

```bash
npm install
npm run db:setup
npm run dev
```

Open **http://localhost:3000**.

**Important:** The seed script only creates the administrator if one does not already exist. Re-running it does not reset an existing administrator password.

## Routes

| URL | What it does |
| --- | --- |
| `/` | Default public student registration form |
| `/login` | Staff login (email + password with show/hide toggle) |
| `/admin/login` | Separate admin login URL (requires user-management permission) |
| `/dashboard` | Registration totals, monthly trend, programs, recent registrations |
| `/students` | Paginated students table, totals, search/filter, offcanvas add/view/edit, disable, delete, record PDF |
| `/reports` | Date range, daily/monthly/quarterly/yearly grouping, search, Excel/PDF exports |
| `/users` | Create/edit/disable/delete staff users, passwords, role assignment |
| `/roles` | Built-in roles and editable custom roles with permission checkboxes |
| `/notifications` | Registration/user notifications, individually marked as read |
| `/settings` | Global registration number format and sequence, registration availability, own password change |

## Initial roles

- **Administrator:** all permissions.
- **Registrar:** dashboard, student view/add/edit, reports view/export, notifications.
- **Viewer:** read-only dashboard, students, reports, notifications.

An administrator can create additional roles and select individual permissions. Built-in roles are locked for safety. Each API endpoint enforces permission checks on the server; hidden buttons alone are not the security boundary.

## Student registration number logic

Set prefix, separator (`/`, `-`, or `_`), optional year, minimum numeric width, and next sequence in **Settings**. For example:

`MON-2026-00001`, `MON-2026-00002` …

The number is reserved **inside the same Prisma transaction as student creation**, using an atomic increment on the singleton settings record, and has a database unique constraint. Public and staff-initiated registrations use the same shared global sequence. **Previously issued IDs are never reformatted**. Editing the prefix, separator, or next sequence can cause collisions with previously issued IDs; check the preview before saving.

## Notes on reporting

Exports follow the selected date range and search filters. Grouping period affects the PDF summary and on-screen chart. Exports read up to **20,000** matching records. The PDF report shows the summary and first **200** student rows, while the Excel workbook includes all fetched matching rows. Each student record has its own downloadable PDF from the students table/view drawer.

## Security and production readiness

This is a complete **local application starter**, not a production-hardened hosted service. Before storing real student data in production:

1. Deploy HTTPS with a trustworthy SMTP/password recovery process, and secure strong secret storage.
2. Add shared persistent rate limiting, bot protection/CAPTCHA on public registration, monitoring, and audit logs. The in-memory public endpoint rate limit is only a development safeguard.
3. Use a managed database with proper backups, retention, and data privacy procedures when deploying across multiple server instances.
4. Apply reviewed Prisma migrations via `prisma migrate dev` during development and `prisma migrate deploy` in production. The initial MySQL migration is included.
5. Set up authentication protection against repeated staff login attempts, security headers, session controls, email verification where required, and periodic dependency security scans.
6. Replace the basic PDF Standard Fonts if full Unicode / regional-language characters must render accurately.
7. Set explicit institutional data policies and permissions prior to collecting personally identifiable student information.

**Note:** GitHub OAuth from the screenshot is deliberately replaced by a working separate Admin Login entry point. GitHub OAuth and password reset-by-email require external provider/SMTP credentials and are not represented as functional features.

## Project structure

```text
app/
  page.tsx                    # Public registration (the default route)
  login/                      # Staff login
  admin/login/                # Separate administrator login
  (portal)/                   # Protected portal pages and layout
  api/                        # Authorized route handlers, exports and authentication
components/                   # Form, shell, dashboard, lists, drawers, charts
lib/                          # Prisma client, session auth, permissions, validation, reports and PDFs
prisma/schema.prisma          # Models: Role, User, Student, AppSetting, Notification, NotificationRead
prisma/seed.ts                # Creates built-in roles and first administrator
```

## Helpful commands

```bash
npm run dev           # Development server
npm run build         # Generate Prisma Client and create optimized build
npm run start         # Run production build
npm run typecheck     # TypeScript static checking
npm run db:setup      # Apply initial migration, generate Client, seed admin
npx prisma studio     # Browse the configured MySQL database
```
