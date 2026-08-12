import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { nanoid } from "nanoid";
import { z } from "zod/v4";
import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";
import { sdk } from "./_core/sdk";
import { adminRouter } from "./adminRouter";


// ============================================================
// LEARNER CONTENT RESOLUTION
// ============================================================
// The admin database is the source of truth for every learner-facing course.
// A course may contain a legacy placeholder module for its final exam; that
// placeholder is excluded when it is the last active module without module questions.
async function getLearnerModules(courseId: number) {
  const activeModules = (await db.getModulesByCourse(courseId))
    .filter((module) => module.activo === 1)
    .sort((a, b) => a.numero - b.numero);
  const moduleQuestions = await Promise.all(
    activeModules.map(async (module) => (await db.getQuestionsByModule(module.id)) ?? [])
  );
  const finalQuestions = (await db.getQuestionsByCourse(courseId, "final")) ?? [];
  const lastModuleNumber = activeModules.at(-1)?.numero;

  return activeModules.filter((module, index) => {
    const isLegacyFinalPlaceholder =
      finalQuestions.length > 0 &&
      module.numero === lastModuleNumber &&
      moduleQuestions[index].length === 0;
    return !isLegacyFinalPlaceholder;
  });
}

// ============================================================
// APP ROUTER
// ============================================================
export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),

    register: publicProcedure
      .input(z.object({
        nombre: z.string().min(2),
        apellido: z.string().min(2),
        email: z.email(),
        password: z.string().min(8),
        region: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const existing = await db.getUserByEmail(input.email);
        if (existing) throw new TRPCError({ code: "CONFLICT", message: "El email ya está registrado." });

        const passwordHash = await bcrypt.hash(input.password, 10);
        const openId = `local_${nanoid()}`;
        const uuidPublico = nanoid();

        await db.upsertUser({
          openId,
          uuidPublico,
          nombre: input.nombre,
          apellido: input.apellido,
          email: input.email,
          passwordHash,
          region: input.region ?? null,
          lastSignedIn: new Date(),
        });

        const user = await db.getUserByEmail(input.email);
        if (!user) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error al crear usuario." });

        const sessionToken = await sdk.createSessionToken(user.openId, {
          name: `${user.nombre} ${user.apellido}`,
          expiresInMs: 365 * 24 * 60 * 60 * 1000,
        });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: 365 * 24 * 60 * 60 * 1000 });

        return { success: true, user: { id: user.id, nombre: user.nombre, email: user.email } };
      }),

    login: publicProcedure
      .input(z.object({ email: z.email(), password: z.string().min(1) }))
      .mutation(async ({ input, ctx }) => {
        const user = await db.getUserByEmail(input.email);
        if (!user || !user.passwordHash) throw new TRPCError({ code: "UNAUTHORIZED", message: "Email o contraseña incorrectos." });

        const valid = await bcrypt.compare(input.password, user.passwordHash);
        if (!valid) throw new TRPCError({ code: "UNAUTHORIZED", message: "Email o contraseña incorrectos." });

        const sessionToken = await sdk.createSessionToken(user.openId, {
          name: `${user.nombre} ${user.apellido}`,
          expiresInMs: 365 * 24 * 60 * 60 * 1000,
        });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: 365 * 24 * 60 * 60 * 1000 });

        await db.upsertUser({ ...user, lastSignedIn: new Date() });
        return { success: true, user: { id: user.id, nombre: user.nombre, email: user.email } };
      }),
  }),

  courses: router({
    getModules: protectedProcedure
      .input(z.object({ level: z.number() }))
      .query(async ({ input, ctx }) => {
        if (input.level === 0) {
          const course = await db.getCourseByNivel(0);
          if (!course || course.activo !== 1) throw new TRPCError({ code: "NOT_FOUND", message: "Curso no disponible aún." });
          const courseModules = await getLearnerModules(course.id);
          const progress = await db.getModuleProgress(ctx.user.id, 0);
          const progressMap = Object.fromEntries(progress.map((p) => [p.moduleNumber, p]));
          return courseModules.map((mod) => ({
            id: mod.numero,
            title: mod.titulo,
            subtitle: mod.descripcion ?? "Material teórico del curso",
            duration: "Lectura PDF",
            content: mod.contenidoMarkdown ?? `# ${mod.titulo}`,
            pdfUrl: mod.pdfUrl,
            pdfNombre: mod.pdfNombre,
            progress: progressMap[mod.numero] ?? null,
          }));
        }

        const course = await db.getCourseByNivel(input.level);
        if (!course || course.activo !== 1) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Nivel no disponible aún." });
        }
        const courseModules = await getLearnerModules(course.id);
        const progress = await db.getModuleProgress(ctx.user.id, input.level);
        const progressMap = Object.fromEntries(progress.map((p) => [p.moduleNumber, p]));
        return courseModules.map((mod) => ({
          id: mod.numero,
          title: mod.titulo,
          subtitle: mod.descripcion ?? "Material teórico del curso",
          duration: "Lectura PDF",
          content: mod.contenidoMarkdown ?? `# ${mod.titulo}`,
          pdfUrl: mod.pdfUrl,
          pdfNombre: mod.pdfNombre,
          progress: progressMap[mod.numero] ?? null,
        }));
      }),

    getModule: protectedProcedure
      .input(z.object({ level: z.number(), moduleNumber: z.number() }))
      .query(async ({ input, ctx }) => {
        if (input.level === 0) {
          const course = await db.getCourseByNivel(0);
          if (!course || course.activo !== 1) throw new TRPCError({ code: "NOT_FOUND", message: "Curso no disponible aún." });
          const courseModules = await getLearnerModules(course.id);
          const mod = courseModules.find((item) => item.numero === input.moduleNumber);
          if (!mod) throw new TRPCError({ code: "NOT_FOUND", message: "Módulo no encontrado." });
          if (input.moduleNumber > 1) {
            const prev = await db.getModuleProgressEntry(ctx.user.id, 0, input.moduleNumber - 1);
            if (!prev || !prev.passed) throw new TRPCError({ code: "FORBIDDEN", message: "Debés aprobar el módulo anterior primero." });
          }
          const progress = await db.getModuleProgressEntry(ctx.user.id, 0, input.moduleNumber);
          return {
            id: mod.numero,
            title: mod.titulo,
            subtitle: mod.descripcion ?? "Material teórico del curso",
            duration: "Lectura PDF",
            content: mod.contenidoMarkdown ?? `# ${mod.titulo}`,
            pdfUrl: mod.pdfUrl,
            pdfNombre: mod.pdfNombre,
            progress,
            totalModules: courseModules.length,
            courseTitle: course.titulo,
          };
        }

        const course = await db.getCourseByNivel(input.level);
        if (!course || course.activo !== 1) throw new TRPCError({ code: "NOT_FOUND", message: "Curso no disponible aún." });
        const courseModules = await getLearnerModules(course.id);
        const mod = courseModules.find((item) => item.numero === input.moduleNumber);
        if (!mod) throw new TRPCError({ code: "NOT_FOUND", message: "Módulo no encontrado." });
        if (input.moduleNumber > 1) {
          const prev = await db.getModuleProgressEntry(ctx.user.id, input.level, input.moduleNumber - 1);
          if (!prev || !prev.passed) throw new TRPCError({ code: "FORBIDDEN", message: "Debés aprobar el módulo anterior primero." });
        }
        const progress = await db.getModuleProgressEntry(ctx.user.id, input.level, input.moduleNumber);
        return {
          id: mod.numero,
          title: mod.titulo,
          subtitle: mod.descripcion ?? "Material teórico del curso",
          duration: "Lectura PDF",
          content: mod.contenidoMarkdown ?? `# ${mod.titulo}`,
          pdfUrl: mod.pdfUrl,
          pdfNombre: mod.pdfNombre,
          progress,
          totalModules: courseModules.length,
          courseTitle: course.titulo,
        };
      }),

    getExamQuestions: protectedProcedure
      .input(z.object({ level: z.number(), moduleNumber: z.number() }))
      .query(async ({ input, ctx }) => {
        if (input.level === 0) {
          const course = await db.getCourseByNivel(0);
          if (!course || course.activo !== 1) throw new TRPCError({ code: "NOT_FOUND", message: "Curso no disponible aún." });
          const courseModules = await getLearnerModules(course.id);
          const isFinal = input.moduleNumber === courseModules.length + 1;
          if (isFinal) {
            for (const mod of courseModules) {
              const p = await db.getModuleProgressEntry(ctx.user.id, 0, mod.numero);
              if (!p || !p.passed) throw new TRPCError({ code: "FORBIDDEN", message: `Debés aprobar el Módulo ${mod.numero} primero.` });
            }
          } else if (input.moduleNumber > 1) {
            const prev = await db.getModuleProgressEntry(ctx.user.id, 0, input.moduleNumber - 1);
            if (!prev || !prev.passed) throw new TRPCError({ code: "FORBIDDEN", message: "Debés aprobar el módulo anterior primero." });
          }
          const dbQuestions = isFinal
            ? await db.getQuestionsByCourse(course.id, "final")
            : await db.getQuestionsByModule(courseModules.find((mod) => mod.numero === input.moduleNumber)?.id ?? -1);
          const activeDbQuestions = (dbQuestions ?? []).filter((q) => q.activo === 1);
          if (!activeDbQuestions.length) throw new TRPCError({ code: "NOT_FOUND", message: "No hay preguntas activas para este examen." });
          return activeDbQuestions.map((q) => ({ question: q.pregunta, options: [q.opcionA, q.opcionB, q.opcionC, q.opcionD] }));
        }

        const course = await db.getCourseByNivel(input.level);
        if (!course || course.activo !== 1) throw new TRPCError({ code: "NOT_FOUND", message: "Curso no disponible aún." });
        const courseModules = await getLearnerModules(course.id);
        if (input.moduleNumber === courseModules.length + 1) {
          for (const mod of courseModules) {
            const p = await db.getModuleProgressEntry(ctx.user.id, input.level, mod.numero);
            if (!p || !p.passed) throw new TRPCError({ code: "FORBIDDEN", message: `Debés aprobar el Módulo ${mod.numero} primero.` });
          }
          const finalQuestions = (await db.getQuestionsByCourse(course.id, "final")) ?? [];
          return finalQuestions.filter((q) => q.activo === 1).map((q) => ({
            question: q.pregunta,
            options: [q.opcionA, q.opcionB, q.opcionC, q.opcionD],
          }));
        }
        if (input.moduleNumber > 1) {
          const prev = await db.getModuleProgressEntry(ctx.user.id, input.level, input.moduleNumber - 1);
          if (!prev || !prev.passed) throw new TRPCError({ code: "FORBIDDEN", message: "Debés aprobar el módulo anterior primero." });
        }
        const mod = courseModules.find((item) => item.numero === input.moduleNumber);
        if (!mod) throw new TRPCError({ code: "NOT_FOUND", message: "Módulo no encontrado." });
        const moduleQuestions = (await db.getQuestionsByModule(mod.id)) ?? [];
        return moduleQuestions.filter((q) => q.activo === 1).map((q) => ({
          question: q.pregunta,
          options: [q.opcionA, q.opcionB, q.opcionC, q.opcionD],
        }));
      }),

    submitExam: protectedProcedure
      .input(z.object({ level: z.number(), moduleNumber: z.number(), answers: z.array(z.number()) }))
      .mutation(async ({ input, ctx }) => {
        let correct = 0;
        let total = 0;
        let isFinal = false;

        if (input.level === 0) {
          const course = await db.getCourseByNivel(0);
          if (!course || course.activo !== 1) throw new TRPCError({ code: "NOT_FOUND", message: "Curso no disponible aún." });
          const courseModules = await getLearnerModules(course.id);
          isFinal = input.moduleNumber === courseModules.length + 1;
          const dbQuestions = isFinal
            ? await db.getQuestionsByCourse(course.id, "final")
            : await db.getQuestionsByModule(courseModules.find((mod) => mod.numero === input.moduleNumber)?.id ?? -1);
          const activeDbQuestions = (dbQuestions ?? []).filter((q) => q.activo === 1);
          if (!activeDbQuestions.length) throw new TRPCError({ code: "NOT_FOUND", message: "No hay preguntas activas para este examen." });
          total = activeDbQuestions.length;
          for (let i = 0; i < activeDbQuestions.length; i++) {
            const correctIndex = { a: 0, b: 1, c: 2, d: 3 }[activeDbQuestions[i].respuestaCorrecta];
            if (input.answers[i] === correctIndex) correct++;
          }
        } else {
          const course = await db.getCourseByNivel(input.level);
          if (!course || course.activo !== 1) throw new TRPCError({ code: "NOT_FOUND", message: "Curso no disponible aún." });
          const courseModules = await getLearnerModules(course.id);
          isFinal = input.moduleNumber === courseModules.length + 1;
          const dbQuestions = isFinal
            ? await db.getQuestionsByCourse(course.id, "final")
            : await db.getQuestionsByModule(courseModules.find((mod) => mod.numero === input.moduleNumber)?.id ?? -1);
          const activeQuestions = (dbQuestions ?? []).filter((q) => q.activo === 1);
          if (!activeQuestions.length) throw new TRPCError({ code: "NOT_FOUND", message: "No hay preguntas activas para este examen." });
          total = activeQuestions.length;
          for (let i = 0; i < activeQuestions.length; i++) {
            const correctIndex = { a: 0, b: 1, c: 2, d: 3 }[activeQuestions[i].respuestaCorrecta];
            if (input.answers[i] === correctIndex) correct++;
          }
        }

        const score = total ? Math.round((correct / total) * 100) : 0;
        const passed = score >= 60;
        const existing = await db.getModuleProgressEntry(ctx.user.id, input.level, input.moduleNumber);
        await db.upsertModuleProgress({
          userId: ctx.user.id,
          courseLevel: input.level,
          moduleNumber: input.moduleNumber,
          examScore: score,
          passed: passed ? 1 : 0,
          attempts: (existing?.attempts ?? 0) + 1,
          completedAt: passed ? new Date() : (existing?.completedAt ?? null),
        });

        let certificate = null;
        if (isFinal && passed) {
          const existingCert = (await db.getCertificatesByUser(ctx.user.id)).find((c) => c.courseLevel === input.level);
          if (!existingCert) {
            const qrCode = `CC${input.level}-${nanoid(12).toUpperCase()}`;
            const expiresAt = new Date();
            expiresAt.setFullYear(expiresAt.getFullYear() + 2);
            certificate = await db.createCertificate({ userId: ctx.user.id, qrCode, courseLevel: input.level, finalScore: score, expiresAt, isValid: 1 });
          } else {
            certificate = existingCert;
          }
          const cp = await db.ensureCourseProgress(ctx.user.id);
          await db.upsertCourseProgress({
            userId: ctx.user.id,
            nivel0Completado: input.level === 0 ? 1 : (cp?.nivel0Completado ?? 0),
            nivel1Completado: input.level === 1 ? 1 : (cp?.nivel1Completado ?? 0),
            nivel2Completado: input.level === 2 ? 1 : (cp?.nivel2Completado ?? 0),
            nivel3Completado: input.level === 3 ? 1 : (cp?.nivel3Completado ?? 0),
            nivel4Completado: input.level === 4 ? 1 : (cp?.nivel4Completado ?? 0),
          });
        }
        return { score, passed, correct, total, certificate };
      }),

    getProgress: protectedProcedure.query(async ({ ctx }) => {
      const courseProgressData = await db.ensureCourseProgress(ctx.user.id);
      const moduleProgressData = await db.getModuleProgress(ctx.user.id, 0);
      const certificates = await db.getCertificatesByUser(ctx.user.id);
      return { courseProgress: courseProgressData, moduleProgress: moduleProgressData, certificates };
    }),
    getAllCourses: protectedProcedure.query(async ({ ctx }) => {
      const allCourses = await db.getAllCourses();
      const userProgress = await db.getCourseProgress(ctx.user.id);
      return allCourses.filter((course) => course.activo === 1).map((course) => ({
        ...course,
        enrolled: (
          (course.nivel === 0 && userProgress?.nivel0Completado === 1) ||
          (course.nivel === 1 && userProgress?.nivel1Completado === 1) ||
          (course.nivel === 2 && userProgress?.nivel2Completado === 1) ||
          (course.nivel === 3 && userProgress?.nivel3Completado === 1) ||
          (course.nivel === 4 && userProgress?.nivel4Completado === 1)
        ),
      }));
    }),
    enrollCourse: protectedProcedure
      .input(z.object({ courseId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const course = await db.getCourseById(input.courseId);
        if (!course || course.activo !== 1) throw new TRPCError({ code: "NOT_FOUND", message: "Curso no disponible." });
        const progress = await db.getCourseProgress(ctx.user.id);
        if (course.nivel === 0 && progress?.nivel0Completado === 1) {
          throw new TRPCError({ code: "CONFLICT", message: "Ya estás inscripto en este curso." });
        }
        if (course.nivel === 1 && progress?.nivel1Completado === 1) {
          throw new TRPCError({ code: "CONFLICT", message: "Ya estás inscripto en este curso." });
        }
        if (course.nivel === 2 && progress?.nivel2Completado === 1) {
          throw new TRPCError({ code: "CONFLICT", message: "Ya estás inscripto en este curso." });
        }
        if (course.nivel === 3 && progress?.nivel3Completado === 1) {
          throw new TRPCError({ code: "CONFLICT", message: "Ya estás inscripto en este curso." });
        }
        if (course.nivel === 4 && progress?.nivel4Completado === 1) {
          throw new TRPCError({ code: "CONFLICT", message: "Ya estás inscripto en este curso." });
        }
        const updateData: any = {
          userId: ctx.user.id,
          nivel0Completado: progress?.nivel0Completado ?? 0,
          nivel1Completado: progress?.nivel1Completado ?? 0,
          nivel2Completado: progress?.nivel2Completado ?? 0,
          nivel3Completado: progress?.nivel3Completado ?? 0,
          nivel4Completado: progress?.nivel4Completado ?? 0,
        };
        if (course.nivel === 0) updateData.nivel0Completado = 1;
        if (course.nivel === 1) updateData.nivel1Completado = 1;
        if (course.nivel === 2) updateData.nivel2Completado = 1;
        if (course.nivel === 3) updateData.nivel3Completado = 1;
        if (course.nivel === 4) updateData.nivel4Completado = 1;
        await db.upsertCourseProgress(updateData);
        return { success: true, message: "¡Inscripción exitosa!", nivel: course.nivel, courseId: course.id };
      }),
  }),

  admin: adminRouter,

  certificates: router({
    getMyCertificates: protectedProcedure.query(async ({ ctx }) => {
      const certs = await db.getCertificatesByUser(ctx.user.id);
      return certs.map((c) => ({ ...c, levelName: c.courseLevel === 0 ? "Explorador Iniciante" : `Nivel ${c.courseLevel}` }));
    }),

    verify: publicProcedure
      .input(z.object({ qrCode: z.string() }))
      .query(async ({ input }) => {
        const cert = await db.getCertificateByQr(input.qrCode);
        if (!cert) return { valid: false, message: "Certificado no encontrado." };
        const user = await db.getUserById(cert.userId);
        if (!user) return { valid: false, message: "Usuario no encontrado." };
        const now = new Date();
        const expired = cert.expiresAt && cert.expiresAt < now;
        return {
          valid: cert.isValid === 1 && !expired,
          expired,
          certificate: { qrCode: cert.qrCode, courseLevel: cert.courseLevel, levelName: cert.courseLevel === 0 ? "Explorador Iniciante" : `Nivel ${cert.courseLevel}`, finalScore: cert.finalScore, issuedAt: cert.issuedAt, expiresAt: cert.expiresAt },
          holder: { nombre: user.nombre, apellido: user.apellido },
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
