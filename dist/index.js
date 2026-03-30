// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/db.ts
import { and, eq, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";

// drizzle/schema.ts
import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  uniqueIndex
} from "drizzle-orm/mysql-core";
var users = mysqlTable("users", {
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
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});
var courses = mysqlTable("courses", {
  id: int("id").autoincrement().primaryKey(),
  nivel: int("nivel").notNull().unique(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descripcion: text("descripcion"),
  precio: int("precio").default(0).notNull(),
  // in USD cents, 0 = free
  activo: int("activo").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull()
});
var modules = mysqlTable("modules", {
  id: int("id").autoincrement().primaryKey(),
  courseId: int("course_id").notNull().references(() => courses.id),
  numero: int("numero").notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descripcion: text("descripcion"),
  contenidoMarkdown: text("contenido_markdown"),
  pdfUrl: text("pdf_url"),
  pdfNombre: varchar("pdf_nombre", { length: 255 }),
  activo: int("activo").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull()
});
var examQuestions = mysqlTable("exam_questions", {
  id: int("id").autoincrement().primaryKey(),
  courseId: int("course_id").notNull().references(() => courses.id),
  moduleId: int("module_id").references(() => modules.id),
  // null = final exam
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
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull()
});
var courseProgress = mysqlTable("course_progress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id),
  nivel0Completado: int("nivel_0_completado").default(0).notNull(),
  nivel1Completado: int("nivel_1_completado").default(0).notNull(),
  nivel2Completado: int("nivel_2_completado").default(0).notNull(),
  nivel3Completado: int("nivel_3_completado").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull()
});
var moduleProgress = mysqlTable(
  "module_progress",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("user_id").notNull().references(() => users.id),
    courseLevel: int("course_level").notNull(),
    moduleNumber: int("module_number").notNull(),
    examScore: int("exam_score").default(0).notNull(),
    passed: int("passed").default(0).notNull(),
    attempts: int("attempts").default(0).notNull(),
    completedAt: timestamp("completed_at")
  },
  (table) => ({
    uniqueUserModule: uniqueIndex("unique_user_module").on(
      table.userId,
      table.courseLevel,
      table.moduleNumber
    )
  })
);
var certificates = mysqlTable("certificates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id),
  qrCode: varchar("qr_code", { length: 64 }).notNull().unique(),
  courseLevel: int("course_level").notNull(),
  finalScore: int("final_score").notNull(),
  issuedAt: timestamp("issued_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
  isValid: int("is_valid").default(1).notNull()
});

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
};

// server/db.ts
import { nanoid } from "nanoid";
var _db = null;
async function getDb() {
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
async function upsertUser(user) {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      openId: user.openId,
      uuidPublico: user.uuidPublico ?? nanoid(),
      nombre: user.nombre ?? "Usuario",
      apellido: user.apellido ?? "",
      email: user.email ?? ""
    };
    const updateSet = {};
    if (user.nombre !== void 0) {
      values.nombre = user.nombre;
      updateSet.nombre = user.nombre;
    }
    if (user.apellido !== void 0) {
      values.apellido = user.apellido;
      updateSet.apellido = user.apellido;
    }
    if (user.email !== void 0) {
      values.email = user.email;
      updateSet.email = user.email;
    }
    if (user.region !== void 0) {
      values.region = user.region;
      updateSet.region = user.region;
    }
    if (user.passwordHash !== void 0) {
      values.passwordHash = user.passwordHash;
      updateSet.passwordHash = user.passwordHash;
    }
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) values.lastSignedIn = /* @__PURE__ */ new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getUserById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getUserByEmail(email) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return await db.select({
    id: users.id,
    nombre: users.nombre,
    apellido: users.apellido,
    email: users.email,
    role: users.role,
    createdAt: users.createdAt,
    lastSignedIn: users.lastSignedIn
  }).from(users).orderBy(desc(users.createdAt));
}
async function updateUserRole(userId, role) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ role }).where(eq(users.id, userId));
}
async function getCourseProgress(userId) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(courseProgress).where(eq(courseProgress.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : null;
}
async function upsertCourseProgress(data) {
  const db = await getDb();
  if (!db) return;
  await db.insert(courseProgress).values(data).onDuplicateKeyUpdate({
    set: {
      nivel0Completado: data.nivel0Completado,
      nivel1Completado: data.nivel1Completado,
      nivel2Completado: data.nivel2Completado,
      nivel3Completado: data.nivel3Completado
    }
  });
}
async function ensureCourseProgress(userId) {
  const existing = await getCourseProgress(userId);
  if (!existing) {
    await upsertCourseProgress({ userId, nivel0Completado: 0, nivel1Completado: 0, nivel2Completado: 0, nivel3Completado: 0 });
    return await getCourseProgress(userId);
  }
  return existing;
}
async function getModuleProgress(userId, courseLevel) {
  const db = await getDb();
  if (!db) return [];
  const conditions = courseLevel !== void 0 ? and(eq(moduleProgress.userId, userId), eq(moduleProgress.courseLevel, courseLevel)) : eq(moduleProgress.userId, userId);
  return await db.select().from(moduleProgress).where(conditions);
}
async function getModuleProgressEntry(userId, courseLevel, moduleNumber) {
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
async function upsertModuleProgress(data) {
  const db = await getDb();
  if (!db) return;
  await db.insert(moduleProgress).values(data).onDuplicateKeyUpdate({
    set: {
      examScore: data.examScore,
      passed: data.passed,
      attempts: data.attempts,
      completedAt: data.completedAt
    }
  });
}
async function getCertificatesByUser(userId) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(certificates).where(eq(certificates.userId, userId));
}
async function getCertificateByQr(qrCode) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(certificates).where(eq(certificates.qrCode, qrCode)).limit(1);
  return result.length > 0 ? result[0] : null;
}
async function createCertificate(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(certificates).values(data);
  return await getCertificateByQr(data.qrCode);
}
async function getAllCertificates() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(certificates).orderBy(desc(certificates.issuedAt));
}
async function getAllCourses() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(courses).orderBy(courses.nivel);
}
async function upsertCourse(data) {
  const db = await getDb();
  if (!db) return;
  if (data.id) {
    await db.update(courses).set({
      titulo: data.titulo,
      descripcion: data.descripcion ?? null,
      precio: data.precio ?? 0,
      activo: data.activo ?? 1
    }).where(eq(courses.id, data.id));
  } else {
    await db.insert(courses).values({
      nivel: data.nivel,
      titulo: data.titulo,
      descripcion: data.descripcion ?? null,
      precio: data.precio ?? 0,
      activo: data.activo ?? 1
    });
  }
}
async function getModulesByCourse(courseId) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(modules).where(eq(modules.courseId, courseId)).orderBy(modules.numero);
}
async function getModuleById(id) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(modules).where(eq(modules.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}
async function upsertModule(data) {
  const db = await getDb();
  if (!db) return;
  if (data.id) {
    await db.update(modules).set({
      titulo: data.titulo,
      descripcion: data.descripcion ?? null,
      contenidoMarkdown: data.contenidoMarkdown ?? null,
      pdfUrl: data.pdfUrl ?? null,
      pdfNombre: data.pdfNombre ?? null,
      activo: data.activo ?? 1
    }).where(eq(modules.id, data.id));
  } else {
    await db.insert(modules).values(data);
  }
}
async function deleteModule(id) {
  const db = await getDb();
  if (!db) return;
  await db.delete(modules).where(eq(modules.id, id));
}
async function getQuestionsByCourse(courseId, examType) {
  const db = await getDb();
  if (!db) return [];
  const conditions = examType ? and(eq(examQuestions.courseId, courseId), eq(examQuestions.examType, examType)) : eq(examQuestions.courseId, courseId);
  return await db.select().from(examQuestions).where(conditions).orderBy(examQuestions.orden);
}
async function getQuestionsByModule(moduleId) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(examQuestions).where(eq(examQuestions.moduleId, moduleId)).orderBy(examQuestions.orden);
}
async function upsertQuestion(data) {
  const db = await getDb();
  if (!db) return;
  if (data.id) {
    await db.update(examQuestions).set({
      pregunta: data.pregunta,
      opcionA: data.opcionA,
      opcionB: data.opcionB,
      opcionC: data.opcionC,
      opcionD: data.opcionD,
      respuestaCorrecta: data.respuestaCorrecta,
      explicacion: data.explicacion ?? null,
      orden: data.orden ?? 0,
      activo: data.activo ?? 1
    }).where(eq(examQuestions.id, data.id));
  } else {
    await db.insert(examQuestions).values(data);
  }
}
async function deleteQuestion(id) {
  const db = await getDb();
  if (!db) return;
  await db.delete(examQuestions).where(eq(examQuestions.id, id));
}
async function getTableStats() {
  const db = await getDb();
  if (!db) return [];
  const tableNames = ["users", "courses", "modules", "exam_questions", "course_progress", "module_progress", "certificates"];
  const stats = await Promise.all(
    tableNames.map(async (t2) => {
      try {
        const result = await db.execute(sql`SELECT COUNT(*) as count FROM ${sql.identifier(t2)}`);
        const rows = result[0];
        return { table: t2, count: Number(rows[0]?.count ?? 0) };
      } catch {
        return { table: t2, count: 0 };
      }
    })
  );
  return stats;
}

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    const redirectUri = atob(state);
    return redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
        await upsertUser({
          openId: userInfo.openId,
          uuidPublico: (await import("nanoid")).nanoid(),
          nombre: userInfo.name || "Usuario",
          apellido: "",
          email: userInfo.email ?? "",
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      uuidPublico: user.uuidPublico,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app) {
  app.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      const { nanoid: nanoid5 } = await import("nanoid");
      await upsertUser({
        openId: userInfo.openId,
        uuidPublico: nanoid5(),
        nombre: userInfo.name || "Usuario",
        apellido: "",
        email: userInfo.email ?? "",
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers.ts
import { nanoid as nanoid3 } from "nanoid";
import { z as z3 } from "zod/v4";
import bcrypt from "bcryptjs";
import { TRPCError as TRPCError4 } from "@trpc/server";

// server/adminRouter.ts
import { TRPCError as TRPCError3 } from "@trpc/server";
import { z as z2 } from "zod/v4";

// server/storage.ts
function getStorageConfig() {
  const baseUrl = ENV.forgeApiUrl;
  const apiKey = ENV.forgeApiKey;
  if (!baseUrl || !apiKey) {
    throw new Error(
      "Storage proxy credentials missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
    );
  }
  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
}
function buildUploadUrl(baseUrl, relKey) {
  const url = new URL("v1/storage/upload", ensureTrailingSlash(baseUrl));
  url.searchParams.set("path", normalizeKey(relKey));
  return url;
}
function ensureTrailingSlash(value) {
  return value.endsWith("/") ? value : `${value}/`;
}
function normalizeKey(relKey) {
  return relKey.replace(/^\/+/, "");
}
function toFormData(data, contentType, fileName) {
  const blob = typeof data === "string" ? new Blob([data], { type: contentType }) : new Blob([data], { type: contentType });
  const form = new FormData();
  form.append("file", blob, fileName || "file");
  return form;
}
function buildAuthHeaders(apiKey) {
  return { Authorization: `Bearer ${apiKey}` };
}
async function storagePut(relKey, data, contentType = "application/octet-stream") {
  const { baseUrl, apiKey } = getStorageConfig();
  const key = normalizeKey(relKey);
  const uploadUrl = buildUploadUrl(baseUrl, key);
  const formData = toFormData(data, contentType, key.split("/").pop() ?? key);
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: buildAuthHeaders(apiKey),
    body: formData
  });
  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(
      `Storage upload failed (${response.status} ${response.statusText}): ${message}`
    );
  }
  const url = (await response.json()).url;
  return { key, url };
}

// server/adminRouter.ts
import { nanoid as nanoid2 } from "nanoid";
var adminProcedure2 = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError3({ code: "FORBIDDEN", message: "Acceso restringido a administradores." });
  }
  return next({ ctx });
});
var adminRouter = router({
  // ── Dashboard stats ──────────────────────────────────────────
  getStats: adminProcedure2.query(async () => {
    const tableStats = await getTableStats();
    return { tables: tableStats };
  }),
  // ── Users ────────────────────────────────────────────────────
  getUsers: adminProcedure2.query(async () => {
    return await getAllUsers();
  }),
  updateUserRole: adminProcedure2.input(z2.object({ userId: z2.number(), role: z2.enum(["user", "admin"]) })).mutation(async ({ input }) => {
    await updateUserRole(input.userId, input.role);
    return { success: true };
  }),
  // ── Courses ──────────────────────────────────────────────────
  getCourses: adminProcedure2.query(async () => {
    return await getAllCourses();
  }),
  upsertCourse: adminProcedure2.input(z2.object({
    id: z2.number().optional(),
    nivel: z2.number(),
    titulo: z2.string().min(1),
    descripcion: z2.string().optional(),
    precio: z2.number().optional(),
    activo: z2.number().optional()
  })).mutation(async ({ input }) => {
    await upsertCourse(input);
    return { success: true };
  }),
  // ── Modules ──────────────────────────────────────────────────
  getModulesByCourse: adminProcedure2.input(z2.object({ courseId: z2.number() })).query(async ({ input }) => {
    return await getModulesByCourse(input.courseId);
  }),
  getModule: adminProcedure2.input(z2.object({ id: z2.number() })).query(async ({ input }) => {
    const mod = await getModuleById(input.id);
    if (!mod) throw new TRPCError3({ code: "NOT_FOUND" });
    return mod;
  }),
  upsertModule: adminProcedure2.input(z2.object({
    id: z2.number().optional(),
    courseId: z2.number(),
    numero: z2.number(),
    titulo: z2.string().min(1),
    descripcion: z2.string().optional(),
    contenidoMarkdown: z2.string().optional(),
    pdfUrl: z2.string().optional(),
    pdfNombre: z2.string().optional(),
    activo: z2.number().optional()
  })).mutation(async ({ input }) => {
    await upsertModule(input);
    return { success: true };
  }),
  deleteModule: adminProcedure2.input(z2.object({ id: z2.number() })).mutation(async ({ input }) => {
    await deleteModule(input.id);
    return { success: true };
  }),
  // ── PDF Upload ───────────────────────────────────────────────
  uploadPdf: adminProcedure2.input(z2.object({
    fileName: z2.string(),
    fileBase64: z2.string(),
    // base64 encoded PDF
    moduleId: z2.number()
  })).mutation(async ({ input }) => {
    const buffer = Buffer.from(input.fileBase64, "base64");
    const key = `modules/pdfs/${input.moduleId}-${nanoid2(8)}-${input.fileName}`;
    const { url } = await storagePut(key, buffer, "application/pdf");
    const mod = await getModuleById(input.moduleId);
    if (mod) {
      await upsertModule({ ...mod, id: mod.id, pdfUrl: url, pdfNombre: input.fileName });
    }
    return { url, key };
  }),
  // ── Exam Questions ───────────────────────────────────────────
  getQuestionsByCourse: adminProcedure2.input(z2.object({ courseId: z2.number(), examType: z2.enum(["module", "final"]).optional() })).query(async ({ input }) => {
    return await getQuestionsByCourse(input.courseId, input.examType);
  }),
  getQuestionsByModule: adminProcedure2.input(z2.object({ moduleId: z2.number() })).query(async ({ input }) => {
    return await getQuestionsByModule(input.moduleId);
  }),
  upsertQuestion: adminProcedure2.input(z2.object({
    id: z2.number().optional(),
    courseId: z2.number(),
    moduleId: z2.number().optional(),
    examType: z2.enum(["module", "final"]).default("module"),
    pregunta: z2.string().min(1),
    opcionA: z2.string().min(1),
    opcionB: z2.string().min(1),
    opcionC: z2.string().min(1),
    opcionD: z2.string().min(1),
    respuestaCorrecta: z2.enum(["a", "b", "c", "d"]),
    explicacion: z2.string().optional(),
    orden: z2.number().default(0),
    activo: z2.number().default(1)
  })).mutation(async ({ input }) => {
    await upsertQuestion(input);
    return { success: true };
  }),
  deleteQuestion: adminProcedure2.input(z2.object({ id: z2.number() })).mutation(async ({ input }) => {
    await deleteQuestion(input.id);
    return { success: true };
  }),
  // ── Certificates ─────────────────────────────────────────────
  getAllCertificates: adminProcedure2.query(async () => {
    return await getAllCertificates();
  })
});

// server/routers.ts
var NIVEL0_MODULES = [
  {
    id: 1,
    title: "\xBFPor qu\xE9 caminamos en la monta\xF1a?",
    subtitle: "Historia, cultura y \xE9tica del senderismo",
    duration: "20 min",
    content: `# M\xF3dulo 1: \xBFPor qu\xE9 caminamos en la monta\xF1a?

## Historia del senderismo en Argentina

El senderismo en Argentina tiene ra\xEDces profundas que se remontan a las primeras expediciones cient\xEDficas del siglo XIX. Naturalistas como Francisco Moreno y Germ\xE1n Burmeister recorrieron la Patagonia y los Andes, documentando una geograf\xEDa que hoy es patrimonio de todos los argentinos.

## La monta\xF1a como espacio compartido

La monta\xF1a no es un lugar de conquista, sino de encuentro. Cada vez que subimos un cerro, compartimos ese espacio con otros senderistas, comunidades locales, fauna y flora nativa, y guardaparques que trabajan para preservar el entorno.

## \xC9tica del senderista responsable

El senderismo responsable se basa en tres principios fundamentales:

**1. No dejar rastro (Leave No Trace)**
Todo lo que llev\xE1s, lo tra\xE9s de vuelta.

**2. Respeto por la vida silvestre**
Manten\xE9 distancia de los animales. No los alimentes.

**3. Consideraci\xF3n con otros visitantes**
La monta\xF1a es un espacio de silencio y contemplaci\xF3n.

## El rol del CCAM

El Centro Cultural Argentino de Monta\xF1a (CCAM) lleva m\xE1s de 22 a\xF1os promoviendo la cultura de monta\xF1a segura y responsable. CumbreCert nace de ese trabajo.

## Resumen

- El senderismo tiene una historia rica en Argentina
- La monta\xF1a es un espacio compartido que debemos cuidar
- La \xE9tica del senderista: no dejar rastro, respetar la fauna, considerar a otros
- Certificarse es una forma de comprometerse con estos valores`
  },
  {
    id: 2,
    title: "\xBFQu\xE9 llevar? Equipamiento esencial",
    subtitle: "Mochila, calzado, hidrataci\xF3n y nutrici\xF3n",
    duration: "25 min",
    content: `# M\xF3dulo 2: \xBFQu\xE9 llevar? Equipamiento esencial

## Las 10 esenciales del senderista

Toda salida a la monta\xF1a requiere llevar los elementos b\xE1sicos de seguridad:

1. **Navegaci\xF3n:** Mapa topogr\xE1fico, br\xFAjula, GPS offline
2. **Protecci\xF3n solar:** FPS 50+, anteojos UV, sombrero
3. **Aislamiento t\xE9rmico:** Ropa de abrigo extra, capa impermeable
4. **Iluminaci\xF3n:** Linterna frontal con pilas de repuesto
5. **Primeros auxilios:** Kit b\xE1sico, medicaci\xF3n personal
6. **Fuego:** Encendedor (solo para emergencias)
7. **Herramientas:** Navaja multiuso, cinta adhesiva
8. **Nutrici\xF3n:** Comida extra para un d\xEDa adicional
9. **Hidrataci\xF3n:** M\xEDnimo 2 litros por persona
10. **Refugio de emergencia:** Manta de supervivencia

## Calzado: la decisi\xF3n m\xE1s importante

**Para senderos marcados:** Zapatillas trail running o botas bajas
**Para trekking de varios d\xEDas:** Botas medianas/altas con tobillo reforzado
**Nunca usar:** Zapatillas urbanas, sandalias, botas de lluvia de goma

## Mochila: tama\xF1o y distribuci\xF3n

- **D\xEDa:** 20-30 litros
- **Fin de semana:** 40-50 litros
- **Traves\xEDa:** 60-80 litros
- Peso m\xE1ximo: 20-25% de tu peso corporal
- Lo m\xE1s pesado: cerca de la espalda y arriba

## Resumen

- Las 10 esenciales son obligatorias en toda salida
- El calzado adecuado previene la mayor\xEDa de los accidentes
- Hidrataci\xF3n m\xEDnima: 2 litros; en altura o calor, m\xE1s
- Peso m\xE1ximo de mochila: 20-25% de tu peso corporal`
  },
  {
    id: 3,
    title: "Clima y meteorolog\xEDa de monta\xF1a",
    subtitle: "C\xF3mo leer el tiempo y cu\xE1ndo no salir",
    duration: "20 min",
    content: `# M\xF3dulo 3: Clima y meteorolog\xEDa de monta\xF1a

## Por qu\xE9 el clima de monta\xF1a es diferente

La monta\xF1a genera su propio microclima. Los cambios pueden ser extremadamente r\xE1pidos y violentos.

**Regla de oro:** Por cada 1000 metros de altitud, la temperatura baja entre 6\xB0C y 10\xB0C.

## Las amenazas clim\xE1ticas principales

### Tormenta el\xE9ctrica
Es la amenaza m\xE1s peligrosa. Se\xF1ales: cielo que se oscurece desde el oeste, viento que cambia de direcci\xF3n, cumulonimbos, cabello que se eriza.

**Qu\xE9 hacer:** Descender de cimas y crestas, alejarse de \xE1rboles aislados y agua.

### Hipotermia
Ocurre cuando la temperatura corporal baja de 35\xB0C. Puede ocurrir con 10\xB0C si hay viento y humedad.

**S\xEDntomas:** Temblores, confusi\xF3n mental, torpeza, somnolencia.

## C\xF3mo leer el pron\xF3stico

**Fuentes confiables:** SMN (smn.gob.ar), Windy.com, Mountain-forecast.com

**Qu\xE9 revisar:** Precipitaci\xF3n, viento en altura, temperatura m\xEDnima, probabilidad de tormenta.

## La regla del retorno

Si sal\xEDs a las 8am, deb\xE9s estar de regreso en la cima antes del mediod\xEDa.

**Nunca subas si:** El pron\xF3stico indica tormentas en las pr\xF3ximas 6 horas, hay nubes que cubren la cumbre, visibilidad menor a 100 metros.

## Resumen

- La temperatura baja 6-10\xB0C por cada 1000m
- Las tormentas el\xE9ctricas son la principal amenaza
- Consult\xE1 siempre el SMN antes de salir
- Regla del retorno: en la cima antes del mediod\xEDa`
  },
  {
    id: 4,
    title: "Orientaci\xF3n y se\xF1alizaci\xF3n",
    subtitle: "C\xF3mo no perderse y qu\xE9 hacer si te perd\xE9s",
    duration: "25 min",
    content: `# M\xF3dulo 4: Orientaci\xF3n y se\xF1alizaci\xF3n

## Los sistemas de se\xF1alizaci\xF3n en Argentina

### Cairns (hitos de piedra)
Acumulaciones de piedras que marcan el camino. Son el sistema m\xE1s com\xFAn en la Patagonia.

**Reglas:** Nunca muevas un cairn. Si encontr\xE1s uno ca\xEDdo, levantalo.

### Marcas en \xE1rboles y rocas
- **Rojo:** Sendero principal
- **Amarillo:** Sendero secundario
- **Azul:** Acceso a refugio

## Orientaci\xF3n con mapa y br\xFAjula

Las curvas de nivel representan la forma del terreno:
- Curvas juntas = pendiente empinada
- Curvas separadas = terreno suave
- Escala m\xE1s com\xFAn en Argentina: 1:50.000 (1cm = 500m)

## Aplicaciones GPS recomendadas (offline)

- **Wikiloc:** Rutas de la comunidad
- **Maps.me:** Mapas offline con senderos
- **Gaia GPS:** Mapas topogr\xE1ficos detallados

**Importante:** Descarg\xE1 los mapas ANTES de salir.

## \xBFQu\xE9 hacer si te perd\xE9s? Protocolo STOP

1. **S - Stop (Parate):** No sigas caminando
2. **T - Think (Pens\xE1):** \xBFCu\xE1ndo estabas seguro del camino?
3. **O - Observe (Observ\xE1):** Mir\xE1 el terreno, el sol, las marcas
4. **P - Plan (Planific\xE1):** Decid\xED una acci\xF3n concreta

**Si no pod\xE9s orientarte:** Qued\xE1te en el lugar. 3 se\xF1ales = pedido de socorro.

## Resumen

- Respet\xE1 y no muevas los cairns
- Llev\xE1 mapa impreso + br\xFAjula + GPS offline
- Si te perd\xE9s: STOP
- 3 se\xF1ales = pedido de socorro`
  },
  {
    id: 5,
    title: "Conducta en la monta\xF1a y Leave No Trace",
    subtitle: "C\xF3mo cuidar el entorno y convivir con otros",
    duration: "20 min",
    content: `# M\xF3dulo 5: Conducta en la monta\xF1a y Leave No Trace

## Los 7 principios de Leave No Trace

1. **Planific\xE1 y preparate** \u2014 Conoc\xE9 las regulaciones, viaj\xE1 en grupos peque\xF1os
2. **Camin\xE1 en superficies resistentes** \u2014 Us\xE1 senderos marcados, acamp\xE1 a 60m del agua
3. **Gestion\xE1 correctamente los residuos** \u2014 Todo lo que llev\xE1s, lo tra\xE9s de vuelta
4. **Dej\xE1 lo que encontr\xE1s** \u2014 No recojas flores, piedras ni artefactos
5. **Minimiz\xE1 el impacto del fuego** \u2014 En Argentina el fuego est\xE1 prohibido en la mayor\xEDa de los parques
6. **Respet\xE1 la vida silvestre** \u2014 30 metros de distancia m\xEDnima, no alimentes animales
7. **S\xE9 considerado con otros** \u2014 Ced\xE9 el paso a quien sube y a animales de carga

## Convivencia en refugios

- Lleg\xE1 antes de las 18hs
- Reserv\xE1 con anticipaci\xF3n en temporada alta
- Respet\xE1 los horarios de silencio (22hs)
- Pag\xE1 la tarifa correspondiente

## Residuos org\xE1nicos

- Alejate 60m del agua, senderos y campamentos
- Cav\xE1 un hoyo de 15-20cm (cathole)
- El papel higi\xE9nico va en bolsa herm\xE9tica y lo tra\xE9s de vuelta

## Resumen

- Los 7 principios LNT son el est\xE1ndar internacional
- Todo residuo que llev\xE1s, lo tra\xE9s de vuelta
- El fuego est\xE1 prohibido en la mayor\xEDa de los parques argentinos
- Respet\xE1 la fauna: 30 metros de distancia m\xEDnima
- Ced\xE9 el paso a quien sube y a animales de carga`
  }
];
var NIVEL0_EXAMS = {
  1: [
    { question: "\xBFCu\xE1l es el primer principio \xE9tico del senderismo responsable?", options: ["Conquistar la cumbre a cualquier costo", "No dejar rastro (Leave No Trace)", "Ir siempre con gu\xEDa certificado", "Llevar GPS obligatorio"], correct: 1 },
    { question: "\xBFQu\xE9 instituci\xF3n avala CumbreCert?", options: ["Club Andino Bariloche", "CCAM (Centro Cultural Argentino de Monta\xF1a)", "Parques Nacionales Argentina", "Ministerio de Turismo"], correct: 1 },
    { question: "\xBFCu\xE1ntos a\xF1os lleva el CCAM promoviendo la cultura de monta\xF1a?", options: ["5 a\xF1os", "10 a\xF1os", "22 a\xF1os", "50 a\xF1os"], correct: 2 },
    { question: "La monta\xF1a como espacio compartido implica:", options: ["Que solo pueden acceder senderistas certificados", "Respetar a otros visitantes, fauna y comunidades locales", "Que el primero en llegar tiene prioridad", "Que se puede acampar en cualquier lugar"], correct: 1 },
    { question: "\xBFQu\xE9 significa 'Leave No Trace'?", options: ["Dejar huellas para que otros puedan seguirte", "No dejar rastro de tu paso por la naturaleza", "Usar solo senderos marcados", "Llevar ropa de colores neutros"], correct: 1 }
  ],
  2: [
    { question: "\xBFCu\xE1ntos litros de agua m\xEDnimo debe llevar cada persona en una salida de d\xEDa?", options: ["0.5 litros", "1 litro", "2 litros", "5 litros"], correct: 2 },
    { question: "\xBFQu\xE9 porcentaje m\xE1ximo de tu peso corporal debe pesar la mochila?", options: ["10%", "20-25%", "40%", "50%"], correct: 1 },
    { question: "\xBFCu\xE1l es el calzado INCORRECTO para senderismo?", options: ["Botas de trekking con tobillo reforzado", "Zapatillas trail running", "Zapatillas de deporte urbanas", "Botas con suela Vibram"], correct: 2 },
    { question: "\xBFQu\xE9 elemento de las 10 esenciales NO debe faltar para emergencias nocturnas?", options: ["C\xE1mara de fotos", "Linterna frontal con pilas de repuesto", "Mapa de la ciudad", "Auriculares"], correct: 1 },
    { question: "\xBFD\xF3nde deben ir los elementos m\xE1s pesados de la mochila?", options: ["En el fondo, lo m\xE1s lejos posible de la espalda", "Cerca de la espalda y arriba", "En los bolsillos laterales", "No importa la distribuci\xF3n"], correct: 1 }
  ],
  3: [
    { question: "\xBFCu\xE1ntos grados baja la temperatura por cada 1000 metros de altitud?", options: ["1-2\xB0C", "3-5\xB0C", "6-10\xB0C", "15-20\xB0C"], correct: 2 },
    { question: "\xBFCu\xE1l es la regla del retorno para evitar tormentas de tarde?", options: ["Estar de regreso en la cima antes de las 8am", "Estar en la cima antes del mediod\xEDa", "Llegar a la cumbre al atardecer", "No hay regla espec\xEDfica"], correct: 1 },
    { question: "\xBFQu\xE9 fuente es confiable para el pron\xF3stico meteorol\xF3gico en Argentina?", options: ["WhatsApp", "SMN (Servicio Meteorol\xF3gico Nacional)", "Redes sociales", "El color del cielo solamente"], correct: 1 },
    { question: "\xBFCu\xE1l es un s\xEDntoma de hipotermia?", options: ["Sudoraci\xF3n excesiva", "Temblores incontrolables y confusi\xF3n mental", "Aumento de la temperatura corporal", "Hambre intensa"], correct: 1 },
    { question: "\xBFCu\xE1ndo NO debes salir a la monta\xF1a?", options: ["Cuando hay sol y viento leve", "Cuando el pron\xF3stico indica tormentas en las pr\xF3ximas 6 horas", "Cuando la temperatura es de 15\xB0C", "Cuando hay pocas nubes"], correct: 1 }
  ],
  4: [
    { question: "\xBFQu\xE9 significa el protocolo STOP cuando te perd\xE9s?", options: ["Saltar, Trepar, Observar, Pedir ayuda", "Parate, Pens\xE1, Observ\xE1, Planific\xE1", "Seguir, Trotar, Orientarse, Progresar", "Se\xF1alizar, Tomar agua, Orientarse, Protegerse"], correct: 1 },
    { question: "\xBFCu\xE1ntas se\xF1ales internacionales equivalen a un pedido de socorro?", options: ["1 se\xF1al", "2 se\xF1ales", "3 se\xF1ales", "5 se\xF1ales"], correct: 2 },
    { question: "\xBFQu\xE9 son los cairns?", options: ["Se\xF1ales pintadas en \xE1rboles", "Acumulaciones de piedras que marcan el camino", "Carteles de parques nacionales", "Aplicaciones GPS"], correct: 1 },
    { question: "\xBFQu\xE9 escala es la m\xE1s com\xFAn en mapas topogr\xE1ficos de Argentina?", options: ["1:1.000", "1:10.000", "1:50.000", "1:1.000.000"], correct: 2 },
    { question: "Si te perd\xE9s, \xBFqu\xE9 es lo primero que debes hacer?", options: ["Correr en busca de se\xF1al de celular", "Parar y no seguir caminando", "Trepar al \xE1rbol m\xE1s alto", "Encender una fogata"], correct: 1 }
  ],
  5: [
    { question: "\xBFA cu\xE1ntos metros m\xEDnimo de fuentes de agua se debe acampar?", options: ["10 metros", "30 metros", "60 metros", "100 metros"], correct: 2 },
    { question: "\xBFQu\xE9 se debe hacer con los residuos org\xE1nicos en la monta\xF1a?", options: ["Enterrarlos en cualquier lugar", "Quemarlos", "Usar cathole a 60m del agua y llevar el papel de vuelta", "Dejarlos cubiertos con hojas"], correct: 2 },
    { question: "\xBFCu\xE1l es la distancia m\xEDnima recomendada para observar mam\xEDferos silvestres?", options: ["5 metros", "15 metros", "30 metros", "100 metros"], correct: 2 },
    { question: "\xBFA qui\xE9n se le cede el paso en un sendero?", options: ["A quien baja (tiene prioridad)", "A quien sube (tiene prioridad) y a animales de carga", "Al grupo m\xE1s grande", "No hay reglas de paso"], correct: 1 },
    { question: "\xBFPor qu\xE9 NO se deben alimentar animales silvestres?", options: ["Porque pueden atacarte", "Porque los hace dependientes del humano y altera su comportamiento natural", "Porque est\xE1 prohibido por ley en todos los casos", "Porque pueden tener enfermedades"], correct: 1 }
  ]
};
var FINAL_EXAM_QUESTIONS = [
  { question: "\xBFCu\xE1l es el principio fundamental de Leave No Trace?", options: ["Conquistar la cumbre siempre", "No dejar rastro de tu paso por la naturaleza", "Ir siempre en grupo grande", "Llevar gu\xEDa obligatorio"], correct: 1 },
  { question: "\xBFCu\xE1ntos litros de agua m\xEDnimo se necesitan por persona en una salida de d\xEDa?", options: ["0.5 litros", "1 litro", "2 litros", "4 litros"], correct: 2 },
  { question: "\xBFCu\xE1ntos grados baja la temperatura por cada 1000m de altitud?", options: ["1-2\xB0C", "3-5\xB0C", "6-10\xB0C", "20\xB0C"], correct: 2 },
  { question: "\xBFQu\xE9 significa la 'S' del protocolo STOP?", options: ["Se\xF1alizar", "Subir", "Parate (Stop)", "Seguir"], correct: 2 },
  { question: "\xBFCu\xE1ntas se\xF1ales internacionales equivalen a un pedido de socorro?", options: ["1", "2", "3", "5"], correct: 2 },
  { question: "\xBFA cu\xE1ntos metros m\xEDnimo de fuentes de agua se debe acampar?", options: ["10m", "30m", "60m", "200m"], correct: 2 },
  { question: "\xBFCu\xE1l es el calzado INCORRECTO para senderismo?", options: ["Botas de trekking", "Trail running", "Zapatillas urbanas", "Botas con suela Vibram"], correct: 2 },
  { question: "\xBFQu\xE9 fuente es confiable para el pron\xF3stico meteorol\xF3gico en Argentina?", options: ["WhatsApp", "SMN (smn.gob.ar)", "Redes sociales", "El color del cielo"], correct: 1 },
  { question: "\xBFQu\xE9 son los cairns?", options: ["Se\xF1ales pintadas en \xE1rboles", "Acumulaciones de piedras que marcan el camino", "Carteles de parques", "Apps GPS"], correct: 1 },
  { question: "\xBFPor qu\xE9 NO se deben alimentar animales silvestres?", options: ["Porque atacan", "Porque los hace dependientes del humano", "Porque est\xE1 siempre prohibido por ley", "Porque tienen enfermedades"], correct: 1 }
];
var appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    }),
    register: publicProcedure.input(z3.object({
      nombre: z3.string().min(2),
      apellido: z3.string().min(2),
      email: z3.email(),
      password: z3.string().min(8),
      region: z3.string().optional()
    })).mutation(async ({ input, ctx }) => {
      const existing = await getUserByEmail(input.email);
      if (existing) throw new TRPCError4({ code: "CONFLICT", message: "El email ya est\xE1 registrado." });
      const passwordHash = await bcrypt.hash(input.password, 10);
      const openId = `local_${nanoid3()}`;
      const uuidPublico = nanoid3();
      await upsertUser({
        openId,
        uuidPublico,
        nombre: input.nombre,
        apellido: input.apellido,
        email: input.email,
        passwordHash,
        region: input.region ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const user = await getUserByEmail(input.email);
      if (!user) throw new TRPCError4({ code: "INTERNAL_SERVER_ERROR", message: "Error al crear usuario." });
      const sessionToken = await sdk.createSessionToken(user.openId, {
        name: `${user.nombre} ${user.apellido}`,
        expiresInMs: 365 * 24 * 60 * 60 * 1e3
      });
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: 365 * 24 * 60 * 60 * 1e3 });
      return { success: true, user: { id: user.id, nombre: user.nombre, email: user.email } };
    }),
    login: publicProcedure.input(z3.object({ email: z3.email(), password: z3.string().min(1) })).mutation(async ({ input, ctx }) => {
      const user = await getUserByEmail(input.email);
      if (!user || !user.passwordHash) throw new TRPCError4({ code: "UNAUTHORIZED", message: "Email o contrase\xF1a incorrectos." });
      const valid = await bcrypt.compare(input.password, user.passwordHash);
      if (!valid) throw new TRPCError4({ code: "UNAUTHORIZED", message: "Email o contrase\xF1a incorrectos." });
      const sessionToken = await sdk.createSessionToken(user.openId, {
        name: `${user.nombre} ${user.apellido}`,
        expiresInMs: 365 * 24 * 60 * 60 * 1e3
      });
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: 365 * 24 * 60 * 60 * 1e3 });
      await upsertUser({ ...user, lastSignedIn: /* @__PURE__ */ new Date() });
      return { success: true, user: { id: user.id, nombre: user.nombre, email: user.email } };
    })
  }),
  courses: router({
    getModules: protectedProcedure.input(z3.object({ level: z3.number() })).query(async ({ input, ctx }) => {
      if (input.level !== 0) throw new TRPCError4({ code: "NOT_FOUND", message: "Nivel no disponible a\xFAn." });
      const progress = await getModuleProgress(ctx.user.id, 0);
      const progressMap = Object.fromEntries(progress.map((p) => [p.moduleNumber, p]));
      return NIVEL0_MODULES.map((m) => ({ ...m, progress: progressMap[m.id] ?? null }));
    }),
    getModule: protectedProcedure.input(z3.object({ level: z3.number(), moduleNumber: z3.number() })).query(async ({ input, ctx }) => {
      if (input.level !== 0) throw new TRPCError4({ code: "NOT_FOUND" });
      const mod = NIVEL0_MODULES.find((m) => m.id === input.moduleNumber);
      if (!mod) throw new TRPCError4({ code: "NOT_FOUND" });
      if (input.moduleNumber > 1) {
        const prev = await getModuleProgressEntry(ctx.user.id, 0, input.moduleNumber - 1);
        if (!prev || !prev.passed) throw new TRPCError4({ code: "FORBIDDEN", message: "Deb\xE9s aprobar el m\xF3dulo anterior primero." });
      }
      const progress = await getModuleProgressEntry(ctx.user.id, 0, input.moduleNumber);
      return { ...mod, progress };
    }),
    getExamQuestions: protectedProcedure.input(z3.object({ level: z3.number(), moduleNumber: z3.number() })).query(async ({ input, ctx }) => {
      if (input.level !== 0) throw new TRPCError4({ code: "NOT_FOUND" });
      if (input.moduleNumber === 6) {
        for (let i = 1; i <= 5; i++) {
          const p = await getModuleProgressEntry(ctx.user.id, 0, i);
          if (!p || !p.passed) throw new TRPCError4({ code: "FORBIDDEN", message: `Deb\xE9s aprobar el M\xF3dulo ${i} primero.` });
        }
        return FINAL_EXAM_QUESTIONS.map((q) => ({ question: q.question, options: q.options }));
      }
      if (input.moduleNumber > 1) {
        const prev = await getModuleProgressEntry(ctx.user.id, 0, input.moduleNumber - 1);
        if (!prev || !prev.passed) throw new TRPCError4({ code: "FORBIDDEN", message: "Deb\xE9s aprobar el m\xF3dulo anterior primero." });
      }
      const questions = NIVEL0_EXAMS[input.moduleNumber];
      if (!questions) throw new TRPCError4({ code: "NOT_FOUND" });
      return questions.map((q) => ({ question: q.question, options: q.options }));
    }),
    submitExam: protectedProcedure.input(z3.object({ level: z3.number(), moduleNumber: z3.number(), answers: z3.array(z3.number()) })).mutation(async ({ input, ctx }) => {
      if (input.level !== 0) throw new TRPCError4({ code: "NOT_FOUND" });
      let questions;
      if (input.moduleNumber === 6) {
        questions = FINAL_EXAM_QUESTIONS;
      } else {
        questions = NIVEL0_EXAMS[input.moduleNumber];
        if (!questions) throw new TRPCError4({ code: "NOT_FOUND" });
      }
      let correct = 0;
      for (let i = 0; i < questions.length; i++) {
        if (input.answers[i] === questions[i].correct) correct++;
      }
      const score = Math.round(correct / questions.length * 100);
      const passed = score >= 60;
      const existing = await getModuleProgressEntry(ctx.user.id, input.level, input.moduleNumber);
      await upsertModuleProgress({
        userId: ctx.user.id,
        courseLevel: input.level,
        moduleNumber: input.moduleNumber,
        examScore: score,
        passed: passed ? 1 : 0,
        attempts: (existing?.attempts ?? 0) + 1,
        completedAt: passed ? /* @__PURE__ */ new Date() : existing?.completedAt ?? null
      });
      let certificate = null;
      if (input.moduleNumber === 6 && passed) {
        const existingCert = (await getCertificatesByUser(ctx.user.id)).find((c) => c.courseLevel === 0);
        if (!existingCert) {
          const qrCode = `CC0-${nanoid3(12).toUpperCase()}`;
          const expiresAt = /* @__PURE__ */ new Date();
          expiresAt.setFullYear(expiresAt.getFullYear() + 2);
          certificate = await createCertificate({ userId: ctx.user.id, qrCode, courseLevel: 0, finalScore: score, expiresAt, isValid: 1 });
          const cp = await getCourseProgress(ctx.user.id);
          await upsertCourseProgress({ userId: ctx.user.id, nivel0Completado: 1, nivel1Completado: cp?.nivel1Completado ?? 0, nivel2Completado: cp?.nivel2Completado ?? 0, nivel3Completado: cp?.nivel3Completado ?? 0 });
        } else {
          certificate = existingCert;
        }
      }
      return { score, passed, correct, total: questions.length, certificate };
    }),
    getProgress: protectedProcedure.query(async ({ ctx }) => {
      const courseProgressData = await ensureCourseProgress(ctx.user.id);
      const moduleProgressData = await getModuleProgress(ctx.user.id, 0);
      const certificates2 = await getCertificatesByUser(ctx.user.id);
      return { courseProgress: courseProgressData, moduleProgress: moduleProgressData, certificates: certificates2 };
    })
  }),
  admin: adminRouter,
  certificates: router({
    getMyCertificates: protectedProcedure.query(async ({ ctx }) => {
      const certs = await getCertificatesByUser(ctx.user.id);
      return certs.map((c) => ({ ...c, levelName: c.courseLevel === 0 ? "Explorador Iniciante" : `Nivel ${c.courseLevel}` }));
    }),
    verify: publicProcedure.input(z3.object({ qrCode: z3.string() })).query(async ({ input }) => {
      const cert = await getCertificateByQr(input.qrCode);
      if (!cert) return { valid: false, message: "Certificado no encontrado." };
      const user = await getUserById(cert.userId);
      if (!user) return { valid: false, message: "Usuario no encontrado." };
      const now = /* @__PURE__ */ new Date();
      const expired = cert.expiresAt && cert.expiresAt < now;
      return {
        valid: cert.isValid === 1 && !expired,
        expired,
        certificate: { qrCode: cert.qrCode, courseLevel: cert.courseLevel, levelName: cert.courseLevel === 0 ? "Explorador Iniciante" : `Nivel ${cert.courseLevel}`, finalScore: cert.finalScore, issuedAt: cert.issuedAt, expiresAt: cert.expiresAt },
        holder: { nombre: user.nombre, apellido: user.apellido }
      };
    })
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/vite.ts
import express from "express";
import fs2 from "fs";
import { nanoid as nanoid4 } from "nanoid";
import path2 from "path";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
var PROJECT_ROOT = import.meta.dirname;
var LOG_DIR = path.join(PROJECT_ROOT, ".manus-logs");
var MAX_LOG_SIZE_BYTES = 1 * 1024 * 1024;
var TRIM_TARGET_BYTES = Math.floor(MAX_LOG_SIZE_BYTES * 0.6);
function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}
function trimLogFile(logPath, maxSize) {
  try {
    if (!fs.existsSync(logPath) || fs.statSync(logPath).size <= maxSize) {
      return;
    }
    const lines = fs.readFileSync(logPath, "utf-8").split("\n");
    const keptLines = [];
    let keptBytes = 0;
    const targetSize = TRIM_TARGET_BYTES;
    for (let i = lines.length - 1; i >= 0; i--) {
      const lineBytes = Buffer.byteLength(`${lines[i]}
`, "utf-8");
      if (keptBytes + lineBytes > targetSize) break;
      keptLines.unshift(lines[i]);
      keptBytes += lineBytes;
    }
    fs.writeFileSync(logPath, keptLines.join("\n"), "utf-8");
  } catch {
  }
}
function writeToLogFile(source, entries) {
  if (entries.length === 0) return;
  ensureLogDir();
  const logPath = path.join(LOG_DIR, `${source}.log`);
  const lines = entries.map((entry) => {
    const ts = (/* @__PURE__ */ new Date()).toISOString();
    return `[${ts}] ${JSON.stringify(entry)}`;
  });
  fs.appendFileSync(logPath, `${lines.join("\n")}
`, "utf-8");
  trimLogFile(logPath, MAX_LOG_SIZE_BYTES);
}
function vitePluginManusDebugCollector() {
  return {
    name: "manus-debug-collector",
    transformIndexHtml(html) {
      if (process.env.NODE_ENV === "production") {
        return html;
      }
      return {
        html,
        tags: [
          {
            tag: "script",
            attrs: {
              src: "/__manus__/debug-collector.js",
              defer: true
            },
            injectTo: "head"
          }
        ]
      };
    },
    configureServer(server) {
      server.middlewares.use("/__manus__/logs", (req, res, next) => {
        if (req.method !== "POST") {
          return next();
        }
        const handlePayload = (payload) => {
          if (payload.consoleLogs?.length > 0) {
            writeToLogFile("browserConsole", payload.consoleLogs);
          }
          if (payload.networkRequests?.length > 0) {
            writeToLogFile("networkRequests", payload.networkRequests);
          }
          if (payload.sessionEvents?.length > 0) {
            writeToLogFile("sessionReplay", payload.sessionEvents);
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true }));
        };
        const reqBody = req.body;
        if (reqBody && typeof reqBody === "object") {
          try {
            handlePayload(reqBody);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
          return;
        }
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });
        req.on("end", () => {
          try {
            const payload = JSON.parse(body);
            handlePayload(payload);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
        });
      });
    }
  };
}
var plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime(), vitePluginManusDebugCollector()];
var vite_config_default = defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1"
    ],
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/_core/vite.ts
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid4()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = process.env.NODE_ENV === "development" ? path2.resolve(import.meta.dirname, "../..", "dist", "public") : path2.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/_core/index.ts
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
  const app = express2();
  const server = createServer(app);
  app.use(express2.json({ limit: "50mb" }));
  app.use(express2.urlencoded({ limit: "50mb", extended: true }));
  registerOAuthRoutes(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
startServer().catch(console.error);
