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

  it("generates certificate when final exam is passed", async () => {
    vi.mocked(db.getModuleProgressEntry).mockResolvedValue({ passed: 1 } as any);
    vi.mocked(db.getCertificatesByUser).mockResolvedValue([]);
    const ctx = makeAuthCtx();
    const caller = appRouter.createCaller(ctx);
    // Final exam correct answers: [1, 2, 2, 2, 2, 2, 2, 1, 1, 1]
    const result = await caller.courses.submitExam({
      level: 0,
      moduleNumber: 6,
      answers: [1, 2, 2, 2, 2, 2, 2, 1, 1, 1],
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
      answers: [1, 2, 2, 2, 2, 2, 2, 1, 1, 1],
    });
    // Should reuse existing cert, not create a new one
    expect(result.certificate?.qrCode).toBe("CC0-EXISTING");
    expect(db.createCertificate).not.toHaveBeenCalled();
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
