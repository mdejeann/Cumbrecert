import fs from "fs";
import path from "path";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { courses, examQuestions, modules } from "../drizzle/schema";
import {
  NIVEL0_COURSE,
  NIVEL0_FINAL_QUESTIONS,
  NIVEL0_MODULE_QUESTIONS,
  NIVEL0_MODULES,
} from "./_data/nivel0";
import { NUDOS_COURSE, NUDOS_FINAL_QUESTIONS, NUDOS_MODULES } from "./_data/nudos";
import { eq } from "drizzle-orm";

const SEED_JSON = path.resolve(process.cwd(), "server/_data/seed.json");

// El export de MySQL usa nombres de columna (snake_case) y fechas como string;
// Drizzle espera las claves del schema (camelCase) y objetos Date
function fromExport<T>(row: Record<string, unknown>): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    const key = k.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
    out[key] = (key === "createdAt" || key === "updatedAt") && typeof v === "string" ? new Date(v) : v;
  }
  return out as T;
}

// Carga el contenido de los cursos la primera vez que se crea la base local
export async function seedIfEmpty(db: LibSQLDatabase) {
  const existing = await db.select({ id: courses.id }).from(courses).limit(1);
  if (existing.length > 0) return;

  if (fs.existsSync(SEED_JSON)) {
    const data = JSON.parse(fs.readFileSync(SEED_JSON, "utf-8"));
    for (const c of data.courses ?? []) await db.insert(courses).values(fromExport(c));
    for (const m of data.modules ?? []) await db.insert(modules).values(fromExport(m));
    for (const q of data.exam_questions ?? []) await db.insert(examQuestions).values(fromExport(q));
    console.log("[Seed] Contenido cargado desde server/_data/seed.json");
    return;
  }

  const [course] = await db.insert(courses).values(NIVEL0_COURSE).returning();
  for (const m of NIVEL0_MODULES) {
    const [mod] = await db.insert(modules).values({ ...m, courseId: course.id }).returning();
    const group = NIVEL0_MODULE_QUESTIONS.find(g => g.moduleNumero === m.numero);
    for (const q of group?.questions ?? []) {
      await db.insert(examQuestions).values({ ...q, courseId: course.id, moduleId: mod.id, examType: "module" });
    }
  }
  for (const q of NIVEL0_FINAL_QUESTIONS) {
    await db.insert(examQuestions).values({ ...q, courseId: course.id, examType: "final" });
  }
  console.log("[Seed] Curso 0 cargado desde server/_data/nivel0.ts");
}

// Agrega el Curso de Nudos (nivel 2) si todavía no existe
export async function ensureNudosCourse(db: LibSQLDatabase) {
  const existing = await db.select({ id: courses.id }).from(courses).where(eq(courses.nivel, NUDOS_COURSE.nivel)).limit(1);
  if (existing.length > 0) {
    // Bases creadas con la práctica 3D: se reemplaza por las fotos del manual
    const mods = await db.select().from(modules).where(eq(modules.courseId, existing[0].id));
    for (const m of mods) {
      const fresh = NUDOS_MODULES.find((x) => x.numero === m.numero);
      if (fresh && m.contenidoMarkdown?.includes("minijuego:")) {
        await db.update(modules).set({ contenidoMarkdown: fresh.contenidoMarkdown }).where(eq(modules.id, m.id));
      }
    }
    if (mods.some((m) => m.numero === 6)) {
      const m6 = mods.find((m) => m.numero === 6)!;
      if (!m6.contenidoMarkdown?.includes("identificar:")) {
        await db.update(modules).set({ contenidoMarkdown: NUDOS_MODULES[5].contenidoMarkdown }).where(eq(modules.id, m6.id));
      }
    }
    return;
  }

  const [course] = await db.insert(courses).values(NUDOS_COURSE).returning();
  for (const { questions, ...m } of NUDOS_MODULES) {
    const [mod] = await db.insert(modules).values({ ...m, courseId: course.id }).returning();
    for (let i = 0; i < questions.length; i++) {
      await db.insert(examQuestions).values({ ...questions[i], courseId: course.id, moduleId: mod.id, examType: "module", orden: i + 1 });
    }
  }
  for (let i = 0; i < NUDOS_FINAL_QUESTIONS.length; i++) {
    await db.insert(examQuestions).values({ ...NUDOS_FINAL_QUESTIONS[i], courseId: course.id, examType: "final", orden: i + 1 });
  }
  console.log("[Seed] Curso de Nudos (nivel 2) cargado");
}
