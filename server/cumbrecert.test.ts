import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ============================================================
// Mock DB helpers so tests don't need a real database
// ============================================================
vi.mock("./db", () => ({
  getUserByEmail: vi.fn(),
  getUserByOpenId: vi.fn(),
  getUserById: vi.fn(),
  upsertUser: vi.fn(),
  getCourseProgress: vi.fn(),
  getCourseByNivel: vi.fn(),
  getCourseById: vi.fn(),
  getModulesByCourse: vi.fn(),
  getQuestionsByCourse: vi.fn(),
  getQuestionsByModule: vi.fn(),
  ensureCourseProgress: vi.fn(),
  upsertCourseProgress: vi.fn(),
  getModuleProgress: vi.fn(),
  getModuleProgressEntry: vi.fn(),
  upsertModuleProgress: vi.fn(),
  getCertificatesByUser: vi.fn(),
  getCertificateByQr: vi.fn(),
  createCertificate: vi.fn(),
}));

// Mock sdk.createSessionToken so we don't need a real JWT secret
vi.mock("./_core/sdk", () => ({
  sdk: {
    createSessionToken: vi.fn().mockResolvedValue("mock-session-token"),
    verifySession: vi.fn(),
    authenticateRequest: vi.fn(),
  },
}));

import * as db from "./db";

// ============================================================
// Helpers
// ============================================================
function makePublicCtx(): TrpcContext {
  const cookies: Record<string, string> = {};
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      cookie: vi.fn((name: string, val: string) => { cookies[name] = val; }),
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

const explorerCourse = { id: 60001, nivel: 0, titulo: "Explorador Iniciante", activo: 1 } as any;
const explorerModules = Array.from({ length: 5 }, (_, index) => ({
  id: 30001 + index,
  courseId: 60001,
  numero: index + 1,
  titulo: [`¿Por qué caminamos?`, `¿Qué llevar?`, `Clima y meteorología`, `Orientación y señalización`, `Conducta en la montaña`][index],
  descripcion: "Contenido administrado",
  contenidoMarkdown: index === 0 ? "Historia del senderismo en Argentina" : `Contenido administrado del módulo ${index + 1}`,
  pdfUrl: `https://cdn.example.com/explorer-${index + 1}.pdf`,
  pdfNombre: `explorer-${index + 1}.pdf`,
  activo: 1,
}));
const explorerModuleQuestions = Array.from({ length: 5 }, (_, index) => ({
  id: index + 1,
  courseId: 60001,
  moduleId: 30001,
  examType: "module",
  pregunta: `Pregunta administrada ${index + 1}`,
  opcionA: "A",
  opcionB: "B",
  opcionC: "C",
  opcionD: "D",
  respuestaCorrecta: ["b", "b", "c", "b", "b"][index],
  activo: 1,
}));
const explorerFinalQuestions = Array.from({ length: 10 }, (_, index) => ({
  id: index + 101,
  courseId: 60001,
  moduleId: null,
  examType: "final",
  pregunta: `Pregunta final administrada ${index + 1}`,
  opcionA: "A",
  opcionB: "B",
  opcionC: "C",
  opcionD: "D",
  respuestaCorrecta: "b",
  activo: 1,
}));

function makeAuthCtx(overrides: Partial<TrpcContext["user"]> = {}): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "local_test123",
      uuidPublico: "uuid-test",
      nombre: "Juan",
      apellido: "Pérez",
      email: "juan@test.com",
      passwordHash: null,
      region: null,
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
      ...overrides,
    } as any,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      cookie: vi.fn(),
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

beforeEach(() => {
  vi.mocked(db.getCourseByNivel).mockResolvedValue(explorerCourse);
  vi.mocked(db.getCourseById).mockResolvedValue(explorerCourse);
  vi.mocked(db.getModulesByCourse).mockResolvedValue(explorerModules as any);
  vi.mocked(db.getQuestionsByModule).mockResolvedValue(explorerModuleQuestions as any);
  vi.mocked(db.getQuestionsByCourse).mockResolvedValue(explorerFinalQuestions as any);
});

// ============================================================
// AUTH TESTS
// ============================================================
describe("auth.logout", () => {
  it("clears the session cookie and returns success", async () => {
    const ctx = makeAuthCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
    expect(ctx.res.clearCookie).toHaveBeenCalled();
  });
});

describe("auth.register", () => {
  beforeEach(() => {
    vi.mocked(db.getUserByEmail).mockResolvedValue(undefined);
    vi.mocked(db.upsertUser).mockResolvedValue(undefined);
    vi.mocked(db.getUserByEmail).mockResolvedValueOnce(undefined).mockResolvedValueOnce({
      id: 1,
      openId: "local_abc",
      uuidPublico: "uuid1",
      nombre: "Juan",
      apellido: "Pérez",
      email: "juan@test.com",
      passwordHash: "$2b$10$hashedpw",
      region: null,
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    } as any);
  });

  it("creates a new user and sets a session cookie", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.register({
      nombre: "Juan",
      apellido: "Pérez",
      email: "juan@test.com",
      password: "password123",
      region: "patagonia",
    });
    expect(result.success).toBe(true);
    expect(result.user.nombre).toBe("Juan");
    expect(ctx.res.cookie).toHaveBeenCalled();
  });

  it("throws CONFLICT if email already exists", async () => {
    // Reset all mocks and set getUserByEmail to always return an existing user
    vi.mocked(db.getUserByEmail).mockReset();
    vi.mocked(db.getUserByEmail).mockResolvedValue({ id: 99, email: "existing@test.com" } as any);
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.auth.register({
        nombre: "Ana",
        apellido: "García",
        email: "existing@test.com",
        password: "password123",
      })
    ).rejects.toThrow("El email ya está registrado.");
  });
});

describe("auth.login", () => {
  it("throws UNAUTHORIZED for unknown email", async () => {
    vi.mocked(db.getUserByEmail).mockResolvedValue(undefined);
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.auth.login({ email: "unknown@test.com", password: "pass" })
    ).rejects.toThrow("Email o contraseña incorrectos.");
  });
});

// ============================================================
// COURSES TESTS
// ============================================================
describe("courses.getModules", () => {
  it("returns 5 modules for level 0", async () => {
    vi.mocked(db.getModuleProgress).mockResolvedValue([]);
    const ctx = makeAuthCtx();
    const caller = appRouter.createCaller(ctx);
    const modules = await caller.courses.getModules({ level: 0 });
    expect(modules).toHaveLength(5);
    expect(modules[0].title).toContain("¿Por qué caminamos");
  });

  it("throws NOT_FOUND for level 1 (not available yet)", async () => {
    vi.mocked(db.getCourseByNivel).mockResolvedValueOnce(undefined);
    const ctx = makeAuthCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.courses.getModules({ level: 1 })).rejects.toThrow();
  });
});

describe("courses.getModule", () => {
  it("returns module 1 without prerequisite check", async () => {
    vi.mocked(db.getModuleProgressEntry).mockResolvedValue(null);
    const ctx = makeAuthCtx();
    const caller = appRouter.createCaller(ctx);
    const mod = await caller.courses.getModule({ level: 0, moduleNumber: 1 });
    expect(mod.id).toBe(1);
    expect(mod.content).toContain("Historia del senderismo");
  });

  it("blocks module 2 if module 1 not passed", async () => {
    vi.mocked(db.getModuleProgressEntry).mockResolvedValue(null);
    const ctx = makeAuthCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.courses.getModule({ level: 0, moduleNumber: 2 })
    ).rejects.toThrow("Debés aprobar el módulo anterior primero.");
  });

  it("allows module 2 if module 1 is passed", async () => {
    vi.mocked(db.getModuleProgressEntry)
      .mockResolvedValueOnce({ passed: 1, examScore: 80, attempts: 1 } as any) // prev check
      .mockResolvedValueOnce(null); // current module progress
    const ctx = makeAuthCtx();
    const caller = appRouter.createCaller(ctx);
    const mod = await caller.courses.getModule({ level: 0, moduleNumber: 2 });
    expect(mod.id).toBe(2);
  });

  it("returns edited Explorador module content from the admin-managed record", async () => {
    vi.mocked(db.getModulesByCourse).mockResolvedValueOnce([
      { ...explorerModules[0], contenidoMarkdown: "# Texto editado en /admin" },
      ...explorerModules.slice(1),
    ] as any);
    const caller = appRouter.createCaller(makeAuthCtx());
    const mod = await caller.courses.getModule({ level: 0, moduleNumber: 1 });
    expect(mod.content).toBe("# Texto editado en /admin");
  });
});

describe("courses.getExamQuestions", () => {
  it("returns 5 questions for module 1", async () => {
    const ctx = makeAuthCtx();
    const caller = appRouter.createCaller(ctx);
    const questions = await caller.courses.getExamQuestions({ level: 0, moduleNumber: 1 });
    expect(questions).toHaveLength(5);
    expect(questions[0]).toHaveProperty("question");
    expect(questions[0]).toHaveProperty("options");
    // Correct answer should NOT be exposed to client
    expect(questions[0]).not.toHaveProperty("correct");
  });

  it("returns 10 questions for final exam (module 6) when all modules passed", async () => {
    vi.mocked(db.getModuleProgressEntry).mockResolvedValue({ passed: 1 } as any);
    const ctx = makeAuthCtx();
    const caller = appRouter.createCaller(ctx);
    const questions = await caller.courses.getExamQuestions({ level: 0, moduleNumber: 6 });
    expect(questions).toHaveLength(10);
  });

  it("blocks final exam if any module not passed", async () => {
    vi.mocked(db.getModuleProgressEntry).mockResolvedValue(null);
    const ctx = makeAuthCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.courses.getExamQuestions({ level: 0, moduleNumber: 6 })
    ).rejects.toThrow();
  });

  it("returns edited Explorador question text and options from /admin", async () => {
    vi.mocked(db.getQuestionsByModule).mockResolvedValue([
      {
        ...explorerModuleQuestions[0],
        pregunta: "¿Pregunta editada en /admin?",
        opcionA: "Opción A actualizada",
        opcionB: "Opción B actualizada",
        respuestaCorrecta: "b",
      },
    ] as any);
    const caller = appRouter.createCaller(makeAuthCtx());
    const questions = await caller.courses.getExamQuestions({ level: 0, moduleNumber: 1 });
    expect(questions).toEqual([
      {
        question: "¿Pregunta editada en /admin?",
        options: ["Opción A actualizada", "Opción B actualizada", "C", "D"],
      },
    ]);
  });
});

describe("courses.submitExam", () => {
  beforeEach(() => {
    vi.mocked(db.getModuleProgressEntry).mockResolvedValue(null);
    vi.mocked(db.upsertModuleProgress).mockResolvedValue(undefined);
    vi.mocked(db.getCertificatesByUser).mockResolvedValue([]);
    vi.mocked(db.createCertificate).mockResolvedValue({ qrCode: "CC0-TESTCODE", courseLevel: 0 } as any);
    vi.mocked(db.getCourseProgress).mockResolvedValue(null);
    vi.mocked(db.upsertCourseProgress).mockResolvedValue(undefined);
  });

  it("scores exam correctly — all correct answers for module 1", async () => {
    const ctx = makeAuthCtx();
    const caller = appRouter.createCaller(ctx);
    // Module 1 correct answers: [1, 1, 2, 1, 1]
    const result = await caller.courses.submitExam({
      level: 0,
      moduleNumber: 1,
      answers: [1, 1, 2, 1, 1],
    });
    expect(result.score).toBe(100);
    expect(result.passed).toBe(true);
    expect(result.correct).toBe(5);
    expect(result.total).toBe(5);
  });

  it("fails exam with score below 60%", async () => {
    const ctx = makeAuthCtx();
    const caller = appRouter.createCaller(ctx);
    // All wrong answers
    const result = await caller.courses.submitExam({
      level: 0,
      moduleNumber: 1,
      answers: [0, 0, 0, 0, 0],
    });
    expect(result.passed).toBe(false);
    expect(result.score).toBeLessThan(60);
  });

  it("grades the edited Explorador correct answer from /admin", async () => {
    vi.mocked(db.getQuestionsByModule).mockResolvedValue([
      {
        ...explorerModuleQuestions[0],
        pregunta: "¿Cuál es la respuesta administrada?",
        opcionA: "Incorrecta",
        opcionB: "Correcta editada",
        opcionC: "Incorrecta",
        opcionD: "Incorrecta",
        respuestaCorrecta: "b",
      },
    ] as any);
    const caller = appRouter.createCaller(makeAuthCtx());
    const result = await caller.courses.submitExam({ level: 0, moduleNumber: 1, answers: [1] });
    expect(result.score).toBe(100);
    expect(result.correct).toBe(1);
    expect(result.total).toBe(1);
  });

  it("generates certificate when final exam is passed", async () => {
    vi.mocked(db.getModuleProgressEntry).mockResolvedValue({ passed: 1 } as any);
    vi.mocked(db.getCertificatesByUser).mockResolvedValue([]);
    const ctx = makeAuthCtx();
    const caller = appRouter.createCaller(ctx);
    // The admin-managed fixture uses option B for all final questions.
    const result = await caller.courses.submitExam({
      level: 0,
      moduleNumber: 6,
      answers: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    });
    expect(result.passed).toBe(true);
    expect(result.certificate).toBeTruthy();
  });

  it("does not create duplicate certificate if already exists", async () => {
    vi.mocked(db.getModuleProgressEntry).mockResolvedValue({ passed: 1 } as any);
    // Return existing cert for this user
    vi.mocked(db.getCertificatesByUser).mockResolvedValue([
      { id: 1, qrCode: "CC0-EXISTING", courseLevel: 0, userId: 1, isValid: 1, finalScore: 80, issuedAt: new Date(), expiresAt: null } as any,
    ]);
    vi.mocked(db.createCertificate).mockClear();
    const ctx = makeAuthCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.courses.submitExam({
      level: 0,
      moduleNumber: 6,
      answers: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    });
    // Should reuse existing cert, not create a new one
    expect(result.certificate?.qrCode).toBe("CC0-EXISTING");
    expect(db.createCertificate).not.toHaveBeenCalled();
  });
});

describe("courses Nivel 1 learner flow", () => {
  const senderistaCourse = { id: 90001, nivel: 1, titulo: "Curso Teórico de Senderista", activo: 1 } as any;
  const senderistaModule = {
    id: 60001,
    courseId: 90001,
    numero: 1,
    titulo: "¿Por qué llevar bastones?",
    descripcion: "Material teórico",
    contenidoMarkdown: "# Bastones",
    pdfUrl: "https://cdn.example.com/senderista-modulo-1.pdf",
    pdfNombre: "Clase 001 bastones.pdf",
    activo: 1,
  } as any;

  beforeEach(() => {
    vi.mocked(db.getCourseById).mockResolvedValue(senderistaCourse);
    vi.mocked(db.getCourseByNivel).mockResolvedValue(senderistaCourse);
    vi.mocked(db.getModulesByCourse).mockResolvedValue([
      senderistaModule,
      { ...senderistaModule, id: 60002, numero: 2 },
      { ...senderistaModule, id: 60003, numero: 3 },
      { ...senderistaModule, id: 60004, numero: 4 },
    ]);
    vi.mocked(db.getCourseProgress).mockResolvedValue({ nivel0Completado: 0, nivel1Completado: 0, nivel2Completado: 0, nivel3Completado: 0, nivel4Completado: 0 } as any);
    vi.mocked(db.upsertCourseProgress).mockResolvedValue(undefined);
    vi.mocked(db.getModuleProgressEntry).mockResolvedValue(null);
    vi.mocked(db.getQuestionsByModule).mockResolvedValue([
      { pregunta: "¿Qué función cumplen los bastones?", opcionA: "Decorativa", opcionB: "Ayudan a descargar las rodillas", opcionC: "Reemplazan el calzado", opcionD: "No tienen función", respuestaCorrecta: "b", activo: 1 },
      { pregunta: "¿Cómo deben regularse?", opcionA: "Según la altura", opcionB: "Siempre al mínimo", opcionC: "Sin regulación", opcionD: "Solo en descenso", respuestaCorrecta: "a", activo: 1 },
      { pregunta: "¿Qué se debe revisar?", opcionA: "El color", opcionB: "El peso", opcionC: "Las puntas y trabas", opcionD: "La marca", respuestaCorrecta: "c", activo: 1 },
      { pregunta: "¿Cuándo ayudan especialmente?", opcionA: "En terrenos irregulares", opcionB: "Solo en interiores", opcionC: "Nunca", opcionD: "Al dormir", respuestaCorrecta: "a", activo: 1 },
      { pregunta: "¿Qué técnica es segura?", opcionA: "Clavarlos en cualquier lugar", opcionB: "Coordinar brazos y piernas", opcionC: "Usarlos como ancla", opcionD: "Llevarlos cerrados", respuestaCorrecta: "b", activo: 1 },
    ] as any);
  });

  it("returns Nivel 1 from enrollment so the UI opens /curso/1/modulo/1", async () => {
    const caller = appRouter.createCaller(makeAuthCtx());
    const result = await caller.courses.enrollCourse({ courseId: 90001 });
    expect(result.nivel).toBe(1);
    expect(result.courseId).toBe(90001);
  });

  it("returns the first Senderista PDF module before the exam", async () => {
    const caller = appRouter.createCaller(makeAuthCtx());
    const module = await caller.courses.getModule({ level: 1, moduleNumber: 1 });
    expect(module.pdfUrl).toBe("https://cdn.example.com/senderista-modulo-1.pdf");
    expect(module.pdfNombre).toBe("Clase 001 bastones.pdf");
    expect(module.totalModules).toBe(4);
  });

  it("loads the five editable questions for Senderista module 1 after the PDF step", async () => {
    const caller = appRouter.createCaller(makeAuthCtx());
    const questions = await caller.courses.getExamQuestions({ level: 1, moduleNumber: 1 });
    expect(questions).toHaveLength(5);
    expect(questions[0]).not.toHaveProperty("correct");
    expect(questions[0].question).toContain("bastones");
  });

  it("reflects an admin-edited module text in the learner response", async () => {
    vi.mocked(db.getModulesByCourse).mockResolvedValueOnce([
      { ...senderistaModule, contenidoMarkdown: "# Texto actualizado desde admin" },
      { ...senderistaModule, id: 60002, numero: 2 },
      { ...senderistaModule, id: 60003, numero: 3 },
      { ...senderistaModule, id: 60004, numero: 4 },
    ] as any);
    const caller = appRouter.createCaller(makeAuthCtx());
    const module = await caller.courses.getModule({ level: 1, moduleNumber: 1 });
    expect(module.content).toBe("# Texto actualizado desde admin");
  });

  it("reflects an admin-edited question wording in the learner exam", async () => {
    vi.mocked(db.getQuestionsByModule).mockResolvedValue([
      { pregunta: "¿Cuál es la palabra actualizada?", opcionA: "A", opcionB: "B", opcionC: "C", opcionD: "D", respuestaCorrecta: "a", activo: 1 },
    ] as any);
    const caller = appRouter.createCaller(makeAuthCtx());
    const questions = await caller.courses.getExamQuestions({ level: 1, moduleNumber: 1 });
    expect(questions[0].question).toBe("¿Cuál es la palabra actualizada?");
  });
});

describe("admin Explorador Iniciante questions", () => {
  it("returns module questions for the Explorador Iniciante course", async () => {
    vi.mocked(db.getQuestionsByCourse).mockResolvedValue(
      Array.from({ length: 25 }, (_, index) => ({ id: index + 1, courseId: 60001, examType: "module" }) as any)
    );
    const caller = appRouter.createCaller(makeAuthCtx({ role: "admin" }));
    const questions = await caller.admin.getQuestionsByCourse({ courseId: 60001, examType: "module" });
    expect(questions).toHaveLength(25);
    expect(questions.every((question) => question.courseId === 60001)).toBe(true);
  });

  it("returns final exam questions for the Explorador Iniciante course", async () => {
    vi.mocked(db.getQuestionsByCourse).mockResolvedValue(
      Array.from({ length: 10 }, (_, index) => ({ id: index + 101, courseId: 60001, examType: "final" }) as any)
    );
    const caller = appRouter.createCaller(makeAuthCtx({ role: "admin" }));
    const questions = await caller.admin.getQuestionsByCourse({ courseId: 60001, examType: "final" });
    expect(questions).toHaveLength(10);
    expect(questions.every((question) => question.examType === "final")).toBe(true);
  });
});

describe("courses.getProgress", () => {
  it("returns course progress, module progress and certificates", async () => {
    vi.mocked(db.ensureCourseProgress).mockResolvedValue({
      userId: 1, nivel0Completado: 0, nivel1Completado: 0, nivel2Completado: 0, nivel3Completado: 0,
    } as any);
    vi.mocked(db.getModuleProgress).mockResolvedValue([]);
    vi.mocked(db.getCertificatesByUser).mockResolvedValue([]);
    const ctx = makeAuthCtx();
    const caller = appRouter.createCaller(ctx);
    const progress = await caller.courses.getProgress();
    expect(progress).toHaveProperty("courseProgress");
    expect(progress).toHaveProperty("moduleProgress");
    expect(progress).toHaveProperty("certificates");
  });
});

describe("certificates.verify", () => {
  it("returns valid certificate info for a known QR code", async () => {
    vi.mocked(db.getCertificateByQr).mockResolvedValue({
      id: 1, qrCode: "CC0-TESTQR", courseLevel: 0, userId: 1, isValid: 1,
      finalScore: 90, issuedAt: new Date(), expiresAt: new Date(Date.now() + 1e10),
    } as any);
    vi.mocked(db.getUserById).mockResolvedValue({
      id: 1, nombre: "Juan", apellido: "Pérez",
    } as any);
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.certificates.verify({ qrCode: "CC0-TESTQR" });
    expect(result.valid).toBe(true);
    expect(result.holder?.nombre).toBe("Juan");
  });

  it("returns invalid for unknown QR code", async () => {
    vi.mocked(db.getCertificateByQr).mockResolvedValue(null);
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.certificates.verify({ qrCode: "INVALID-QR" });
    expect(result.valid).toBe(false);
  });
});
