import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";
import { protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";
import { NIVEL0_COURSE, NIVEL0_MODULES, NIVEL0_MODULE_QUESTIONS, NIVEL0_FINAL_QUESTIONS } from "./_data/nivel0";

// Admin-only middleware
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Acceso restringido a administradores." });
  }
  return next({ ctx });
});

export const adminRouter = router({
  // ── Dashboard stats ──────────────────────────────────────────
  getStats: adminProcedure.query(async () => {
    const tableStats = await db.getTableStats();
    return { tables: tableStats };
  }),

  // ── Users ────────────────────────────────────────────────────
  getUsers: adminProcedure.query(async () => {
    return await db.getAllUsers();
  }),

  updateUserRole: adminProcedure
    .input(z.object({ userId: z.number(), role: z.enum(["user", "admin"]) }))
    .mutation(async ({ input }) => {
      await db.updateUserRole(input.userId, input.role);
      return { success: true };
    }),

  // ── Courses ──────────────────────────────────────────────────
  getCourses: adminProcedure.query(async () => {
    return await db.getAllCourses();
  }),

  upsertCourse: adminProcedure
    .input(z.object({
      id: z.number().optional(),
      nivel: z.number(),
      titulo: z.string().min(1),
      descripcion: z.string().optional(),
      precio: z.number().optional(),
      activo: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      await db.upsertCourse(input);
      return { success: true };
    }),

  // ── Modules ──────────────────────────────────────────────────
  getModulesByCourse: adminProcedure
    .input(z.object({ courseId: z.number() }))
    .query(async ({ input }) => {
      return await db.getModulesByCourse(input.courseId);
    }),

  getModule: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const mod = await db.getModuleById(input.id);
      if (!mod) throw new TRPCError({ code: "NOT_FOUND" });
      return mod;
    }),

  upsertModule: adminProcedure
    .input(z.object({
      id: z.number().optional(),
      courseId: z.number(),
      numero: z.number(),
      titulo: z.string().min(1),
      descripcion: z.string().optional(),
      contenidoMarkdown: z.string().optional(),
      pdfUrl: z.string().optional(),
      pdfNombre: z.string().optional(),
      activo: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      await db.upsertModule(input);
      return { success: true };
    }),

  deleteModule: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteModule(input.id);
      return { success: true };
    }),

  // ── PDF Upload ───────────────────────────────────────────────
  uploadPdf: adminProcedure
    .input(z.object({
      fileName: z.string(),
      fileBase64: z.string(), // base64 encoded PDF
      moduleId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const buffer = Buffer.from(input.fileBase64, "base64");
      const key = `modules/pdfs/${input.moduleId}-${nanoid(8)}-${input.fileName}`;
      const { url } = await storagePut(key, buffer, "application/pdf");
      // Update the module with the new PDF URL
      const mod = await db.getModuleById(input.moduleId);
      if (mod) {
        await db.upsertModule({ ...mod, id: mod.id, pdfUrl: url, pdfNombre: input.fileName });
      }
      return { url, key };
    }),

  // ── Exam Questions ───────────────────────────────────────────
  getQuestionsByCourse: adminProcedure
    .input(z.object({ courseId: z.number(), examType: z.enum(["module", "final"]).optional() }))
    .query(async ({ input }) => {
      return await db.getQuestionsByCourse(input.courseId, input.examType);
    }),

  getQuestionsByModule: adminProcedure
    .input(z.object({ moduleId: z.number() }))
    .query(async ({ input }) => {
      return await db.getQuestionsByModule(input.moduleId);
    }),

  upsertQuestion: adminProcedure
    .input(z.object({
      id: z.number().optional(),
      courseId: z.number(),
      moduleId: z.number().optional(),
      examType: z.enum(["module", "final"]).default("module"),
      pregunta: z.string().min(1),
      opcionA: z.string().min(1),
      opcionB: z.string().min(1),
      opcionC: z.string().min(1),
      opcionD: z.string().min(1),
      respuestaCorrecta: z.enum(["a", "b", "c", "d"]),
      explicacion: z.string().optional(),
      orden: z.number().default(0),
      activo: z.number().default(1),
    }))
    .mutation(async ({ input }) => {
      await db.upsertQuestion(input);
      return { success: true };
    }),

  deleteQuestion: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteQuestion(input.id);
      return { success: true };
    }),

  // ── Seed Nivel 0 content ──────────────────────────────────────
  seedNivel0: adminProcedure
    .mutation(async () => {
      // 1. Upsert course
      await db.upsertCourse(NIVEL0_COURSE);
      const course = await db.getCourseByNivel(0);
      if (!course) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "No se pudo crear el curso." });

      // 2. Check if already seeded
      const existingModules = await db.getModulesByCourse(course.id);
      if (existingModules.length > 0) {
        return { success: true, message: "El contenido ya estaba cargado.", skipped: true };
      }

      // 3. Insert modules
      for (const mod of NIVEL0_MODULES) {
        await db.upsertModule({ courseId: course.id, activo: 1, ...mod });
      }

      // 4. Fetch inserted modules to get their DB ids
      const dbModules = await db.getModulesByCourse(course.id);
      const moduleMap = Object.fromEntries(dbModules.map((m) => [m.numero, m.id]));

      // 5. Insert per-module questions
      for (const { moduleNumero, questions } of NIVEL0_MODULE_QUESTIONS) {
        const moduleId = moduleMap[moduleNumero];
        if (!moduleId) continue;
        for (const q of questions) {
          await db.upsertQuestion({
            courseId: course.id,
            moduleId,
            examType: "module",
            ...q,
            activo: 1,
          });
        }
      }

      // 6. Insert final exam questions
      for (const q of NIVEL0_FINAL_QUESTIONS) {
        await db.upsertQuestion({
          courseId: course.id,
          moduleId: undefined,
          examType: "final",
          ...q,
          activo: 1,
        });
      }

      return { success: true, message: "Contenido del Nivel 0 cargado exitosamente.", skipped: false };
    }),

  // ── Certificates ─────────────────────────────────────────────
  getAllCertificates: adminProcedure.query(async () => {
    return await db.getAllCertificates();
  }),
});
