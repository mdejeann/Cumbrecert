import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  certificates,
  courseProgress,
  InsertCertificate,
  InsertCourseProgress,
  InsertModuleProgress,
  InsertUser,
  moduleProgress,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";
import { nanoid } from "nanoid";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================================
// USER HELPERS
// ============================================================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }

  try {
    const values: InsertUser = {
      openId: user.openId,
      uuidPublico: user.uuidPublico ?? nanoid(),
      nombre: user.nombre ?? "Usuario",
      apellido: user.apellido ?? "",
      email: user.email ?? "",
    };
    const updateSet: Record<string, unknown> = {};

    if (user.nombre !== undefined) { values.nombre = user.nombre; updateSet.nombre = user.nombre; }
    if (user.apellido !== undefined) { values.apellido = user.apellido; updateSet.apellido = user.apellido; }
    if (user.email !== undefined) { values.email = user.email; updateSet.email = user.email; }
    if (user.region !== undefined) { values.region = user.region; updateSet.region = user.region; }
    if (user.passwordHash !== undefined) { values.passwordHash = user.passwordHash; updateSet.passwordHash = user.passwordHash; }
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }

    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByUuid(uuid: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.uuidPublico, uuid)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============================================================
// COURSE PROGRESS HELPERS
// ============================================================

export async function getCourseProgress(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(courseProgress).where(eq(courseProgress.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function upsertCourseProgress(data: InsertCourseProgress) {
  const db = await getDb();
  if (!db) return;
  await db.insert(courseProgress).values(data).onDuplicateKeyUpdate({
    set: {
      nivel0Completado: data.nivel0Completado,
      nivel1Completado: data.nivel1Completado,
      nivel2Completado: data.nivel2Completado,
      nivel3Completado: data.nivel3Completado,
    },
  });
}

export async function ensureCourseProgress(userId: number) {
  const existing = await getCourseProgress(userId);
  if (!existing) {
    await upsertCourseProgress({ userId, nivel0Completado: 0, nivel1Completado: 0, nivel2Completado: 0, nivel3Completado: 0 });
    return await getCourseProgress(userId);
  }
  return existing;
}

// ============================================================
// MODULE PROGRESS HELPERS
// ============================================================

export async function getModuleProgress(userId: number, courseLevel?: number) {
  const db = await getDb();
  if (!db) return [];
  const conditions = courseLevel !== undefined
    ? and(eq(moduleProgress.userId, userId), eq(moduleProgress.courseLevel, courseLevel))
    : eq(moduleProgress.userId, userId);
  return await db.select().from(moduleProgress).where(conditions);
}

export async function getModuleProgressEntry(userId: number, courseLevel: number, moduleNumber: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(moduleProgress).where(
    and(
      eq(moduleProgress.userId, userId),
      eq(moduleProgress.courseLevel, courseLevel),
      eq(moduleProgress.moduleNumber, moduleNumber)
    )
  ).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function upsertModuleProgress(data: InsertModuleProgress) {
  const db = await getDb();
  if (!db) return;
  await db.insert(moduleProgress).values(data).onDuplicateKeyUpdate({
    set: {
      examScore: data.examScore,
      passed: data.passed,
      attempts: data.attempts,
      completedAt: data.completedAt,
    },
  });
}

// ============================================================
// CERTIFICATE HELPERS
// ============================================================

export async function getCertificatesByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(certificates).where(eq(certificates.userId, userId));
}

export async function getCertificateByQr(qrCode: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(certificates).where(eq(certificates.qrCode, qrCode)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createCertificate(data: InsertCertificate) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(certificates).values(data);
  return await getCertificateByQr(data.qrCode!);
}
