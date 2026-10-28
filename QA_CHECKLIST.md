# Monoline acceptance-test checklist

Run `npm install`, configure `.env`, `npm run db:setup`, and `npm run dev` before these checks.

## Public and authentication

- [ ] `/` opens the student registration form (not the dashboard).
- [ ] `/login` uses the Monoline split-screen design with a working password visibility toggle.
- [ ] `/admin/login` is a distinct admin sign-in page.
- [ ] Incorrect credentials show a meaningful error; inactive users cannot sign in.
- [ ] Administrator credentials from `.env` work after seeding.
- [ ] Staff can access only routes/actions granted to their role.

## Registration and student management

- [ ] Register a student publicly and record the generated ID.
- [ ] Register another student as staff and confirm the sequence increases globally.
- [ ] The Students page shows an updated total and the two records.
- [ ] Search filters by student name, registration ID, email or program.
- [ ] Add, View and Edit use the right-side offcanvas drawer.
- [ ] Disable / enable toggles a student record; Delete requires confirmation.
- [ ] The PDF download produces a document with the correct registration ID and fields.

## Admin workspace

- [ ] Dashboard cards, monthly chart, program chart and recent-student table reflect database records.
- [ ] Reports support date range, search and daily/monthly/quarterly/yearly grouping.
- [ ] Report Excel and PDF downloads use current filters.
- [ ] Users can be added, assigned a role, edited, disabled and deleted.
- [ ] Custom roles can be created, edited and deleted; built-in roles remain protected.
- [ ] Notifications appear in top bar and on the full notifications page; read state is per user.
- [ ] Light/dark theme toggle works and persists on refresh.
- [ ] Settings allows editing ID prefix, year inclusion, padding and next sequence.
- [ ] Changing your password invalidates the current login and allows reauthentication with the new one.

## Negative / security checks

- [ ] A Viewer cannot create/edit/delete student records by invoking APIs directly.
- [ ] A Registrar cannot manage users, roles or global settings through APIs.
- [ ] A user cannot disable or delete their own user account.
- [ ] A custom role with no report-export permission cannot export report files.
- [ ] Existing IDs do not change when you update the ID format.
- [ ] Duplicate ID sequence/format combinations are rejected without persisting a duplicate.
- [ ] Public registrations fail when public registration is disabled in Settings.

## Validation performed in delivery environment

- TypeScript and TSX source syntax parsed successfully (54 files, zero syntax diagnostics).
- Internal `@/` imports matched existing project files.
- Initial SQLite migration executed successfully against an in-memory SQLite database.
- Full npm install, Prisma generate, type checking and Next.js browser/runtime tests **could not be run** because the package registry was not reachable from the delivery environment.
