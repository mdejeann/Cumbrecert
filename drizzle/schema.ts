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
// COURSES TABLE
// Admin-managed course definitions
// ============================================================
export const courses = mysqlTable("courses", {
  id: int("id").autoincrement().primaryKey(),
  nivel: int("nivel").notNull().unique(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descripcion: text("descripcion"),
  precio: int("precio").default(0).notNull(), // in USD cents, 0 = free
  activo: int("activo").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Course = typeof courses.$inferSelect;
export type InsertCourse = typeof courses.$inferInsert;

// ============================================================
// MODULES TABLE
// Admin-managed modules per course — content + PDF
// ============================================================
export const modules = mysqlTable("modules", {
  id: int("id").autoincrement().primaryKey(),
  courseId: int("course_id")
    .notNull()
    .references(() => courses.id),
  numero: int("numero").notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descripcion: text("descripcion"),
  contenidoMarkdown: text("contenido_markdown"),
  pdfUrl: text("pdf_url"),
  pdfNombre: varchar("pdf_nombre", { length: 255 }),
  activo: int("activo").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Module = typeof modules.$inferSelect;
export type InsertModule = typeof modules.$inferInsert;

// ============================================================
// EXAM QUESTIONS TABLE
// Admin-managed multiple choice questions per module
// examType: 'module' = per-module exam, 'final' = integrating exam
// ============================================================
export const examQuestions = mysqlTable("exam_questions", {
  id: int("id").autoincrement().primaryKey(),
  courseId: int("course_id")
    .notNull()
    .references(() => courses.id),
  moduleId: int("module_id").references(() => modules.id), // null = final exam
  examType: mysqlEnum("exam_type", ["module", "final"]).default("module").notNull(),
  pregunta: text("pregunta").notNull(),
  opcionA: text("opcion_a").notNull(),
  opcionB: text("opcion_b").notNull(),
  opcionC: text("opcion_c").notNull(),
  opcionD: text("opcion_d").notNull(),
  respuestaCorrecta: mysqlEnum("respuesta_correcta", ["a", "b", "c", "d"]).notNull(),
  explicacion: text("explicacion"),
  orden: int("orden").default(0).notNull(),
  activo: int("activo").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type ExamQuestion = typeof examQuestions.$inferSelect;
export type InsertExamQuestion = typeof examQuestions.$inferInsert;

// ============================================================
// COURSE PROGRESS TABLE
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
