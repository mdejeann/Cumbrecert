import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";
import { protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";

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

  // ── Certificates ─────────────────────────────────────────────
  getAllCertificates: adminProcedure.query(async () => {
    return await db.getAllCertificates();
  }),
});
