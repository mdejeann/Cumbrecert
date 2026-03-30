# CumbreCert TODO

## Phase 1 — DB & Schema
- [x] Fix schema.ts with full CumbreCert tables (users, course_progress, module_progress, certificates)
- [x] Fix sdk.ts OAuth upsertUser call to be compatible with new schema
- [x] Run pnpm db:push to migrate schema to production DB

## Phase 2 — Backend tRPC Routers
- [x] Auth router: register (email+password), login (JWT), me
- [x] Courses router: list courses, enroll, get modules
- [x] Exam router: submit answers, score, pass/fail
- [x] Certificate router: generate on final exam pass, verify by QR

## Phase 3 — Auth UI
- [x] /register page with form (nombre, apellido, email, password, region)
- [x] /login page with form (email, password)
- [x] Update navbar: "Iniciar sesión" button + avatar dropdown when logged in

## Phase 4 — Dashboard
- [x] /dashboard page (protected route, redirect to /login if not authenticated)
- [x] Show course cards (Nivel 0 free, others coming soon)
- [x] Show progress bar for Nivel 0 if started
- [x] Show certificates section if any

## Phase 5 — Course Platform Nivel 0
- [x] /curso/0/modulo/:n page with content + exam layout
- [x] Module 1: ¿Por qué caminamos? — content + exam (5 questions)
- [x] Module 2: ¿Qué llevar? — content + exam (5 questions)
- [x] Module 3: Clima y meteorología — content + exam (5 questions)
- [x] Module 4: Orientación y señalización — content + exam (5 questions)
- [x] Module 5: Conducta en la montaña — content + exam (5 questions)
- [x] Lock/unlock logic: modules unlock sequentially after passing previous exam

## Phase 6 — Final Exam & Certificate
- [x] Examen integrador (module 6) with 10 questions from all modules
- [x] Score calculation and pass/fail (60% minimum)
- [x] Certificate notification modal on pass
- [x] Public QR verification via certificates.verify endpoint

## Phase 7 — Testing & Deploy
- [x] Vitest tests — 20/20 passing (auth, courses, exams, certificates)
- [ ] Save checkpoint
- [ ] Push to GitHub

## Fixes
- [x] Remove "¿Dónde salís a la montaña?" (region) field from Register form
- [x] Fix DB error on register: `is_active` column dropped + new columns added to DB

## Admin Panel
- [ ] Extend DB schema: courses, modules, exam_questions tables
- [ ] Run DB migrations
- [ ] Admin tRPC routers: courses CRUD, modules CRUD, questions CRUD, PDF upload, DB viewer
- [ ] Admin layout with sidebar navigation
- [ ] Admin page: Courses list + create/edit course
- [ ] Admin page: Module editor (content markdown + PDF upload)
- [ ] Admin page: Question editor (multiple choice per module + final exam)
- [ ] Admin page: DB Viewer (browse tables, run queries)
- [ ] Admin page: Users list
- [ ] Protect /admin routes with admin role check
- [ ] Wire all admin routes in App.tsx
- [ ] Tests for admin procedures
- [ ] Checkpoint + push to GitHub
