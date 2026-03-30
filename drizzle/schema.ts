import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

// ============================================================
// USERS TABLE
// id: INTEGER AUTOINCREMENT (starting at 10001 via seed)
// uuidPublico: UUID v4 for public URLs and QR codes — never expose `id` in frontend
// ============================================================
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  uuidPublico: varchar("uuid_publico", { length: 64 }),
  nombre: text("nombre"),
  apellido: text("apellido"),
  email: varchar("email", { length: 320 }),
  passwordHash: text("password_hash"),
  region: text("region"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================================
// COURSE PROGRESS TABLE
// One row per user — tracks overall level completion
// ============================================================
export const courseProgress = mysqlTable("course_progress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id")
    .notNull()
    .references(() => users.id),
  nivel0Completado: int("nivel_0_completado").default(0).notNull(),
  nivel1Completado: int("nivel_1_completado").default(0).notNull(),
  nivel2Completado: int("nivel_2_completado").default(0).notNull(),
  nivel3Completado: int("nivel_3_completado").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type CourseProgress = typeof courseProgress.$inferSelect;
export type InsertCourseProgress = typeof courseProgress.$inferInsert;

// ============================================================
// MODULE PROGRESS TABLE
// Detailed per-module progress with exam scores
// ============================================================
export const moduleProgress = mysqlTable(
  "module_progress",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("user_id")
      .notNull()
      .references(() => users.id),
    courseLevel: int("course_level").notNull(),
    moduleNumber: int("module_number").notNull(),
    examScore: int("exam_score").default(0).notNull(),
    passed: int("passed").default(0).notNull(),
    attempts: int("attempts").default(0).notNull(),
    completedAt: timestamp("completed_at"),
  },
  (table) => ({
    uniqueUserModule: uniqueIndex("unique_user_module").on(
      table.userId,
      table.courseLevel,
      table.moduleNumber
    ),
  })
);

export type ModuleProgress = typeof moduleProgress.$inferSelect;
export type InsertModuleProgress = typeof moduleProgress.$inferInsert;

// ============================================================
// CERTIFICATES TABLE
// Issued certificates with QR codes and expiry
// ============================================================
export const certificates = mysqlTable("certificates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id")
    .notNull()
    .references(() => users.id),
  qrCode: varchar("qr_code", { length: 64 }).notNull().unique(),
  courseLevel: int("course_level").notNull(),
  finalScore: int("final_score").notNull(),
  issuedAt: timestamp("issued_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
  isValid: int("is_valid").default(1).notNull(),
});

export type Certificate = typeof certificates.$inferSelect;
export type InsertCertificate = typeof certificates.$inferInsert;