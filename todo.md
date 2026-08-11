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
- [x] Save checkpoint
- [x] Push to GitHub

## Admin Panel
- [x] Extend DB schema: courses, modules, exam_questions tables
- [x] Run DB migrations
- [x] Admin tRPC routers: courses CRUD, modules CRUD, questions CRUD, PDF upload, DB viewer
- [x] Admin layout with sidebar navigation
- [x] Admin page: Courses list + create/edit course
- [x] Admin page: Module editor (content markdown + PDF upload)
- [x] Admin page: Question editor (multiple choice per module + final exam)
- [x] Admin page: DB Viewer (browse tables, run queries)
- [x] Admin page: Users list
- [x] Protect /admin routes with admin role check
- [x] Wire all admin routes in App.tsx
- [x] Tests for admin procedures
- [x] Checkpoint + push to GitHub

## Fixes
- [x] Remove "¿Dónde salís a la montaña?" (region) field from Register form
- [x] Fix DB error on register: `is_active` column dropped + new columns added to DB

## User Features
- [x] Dashboard: Show available courses with prices and enroll buttons
- [x] Mostrar "Curso Teórico de Senderista" como curso Nivel 1 en el dashboard para cualquier usuario autenticado
- [x] Mostrar "Explorador Iniciante" y "Curso Teórico de Senderista" en Otros cursos disponibles con títulos y acciones correctas
- [x] Permitir inscripción al curso Nivel 1 y mostrarlo como curso elegido después de inscribirse
- [ ] Verificar pruebas, guardar checkpoint y hacer commit de los cambios en GitHub
- [ ] Guardar un nuevo checkpoint con los cambios del dashboard y Nivel 1
- [ ] Hacer commit y push a GitHub de los cambios verificados
