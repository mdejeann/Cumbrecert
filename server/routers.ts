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

// ============================================================
// COURSE CONTENT DATA (Nivel 0 — 5 modules + final exam)
// ============================================================
const NIVEL0_MODULES = [
  {
    id: 1,
    title: "¿Por qué caminamos en la montaña?",
    subtitle: "Historia, cultura y ética del senderismo",
    duration: "20 min",
    content: `# Módulo 1: ¿Por qué caminamos en la montaña?\n\n## Historia del senderismo en Argentina\n\nEl senderismo en Argentina tiene raíces profundas que se remontan a las primeras expediciones científicas del siglo XIX. Naturalistas como Francisco Moreno y Germán Burmeister recorrieron la Patagonia y los Andes, documentando una geografía que hoy es patrimonio de todos los argentinos.\n\n## La montaña como espacio compartido\n\nLa montaña no es un lugar de conquista, sino de encuentro. Cada vez que subimos un cerro, compartimos ese espacio con otros senderistas, comunidades locales, fauna y flora nativa, y guardaparques que trabajan para preservar el entorno.\n\n## Ética del senderista responsable\n\nEl senderismo responsable se basa en tres principios fundamentales:\n\n**1. No dejar rastro (Leave No Trace)**\nTodo lo que llevás, lo traés de vuelta.\n\n**2. Respeto por la vida silvestre**\nMantené distancia de los animales. No los alimentes.\n\n**3. Consideración con otros visitantes**\nLa montaña es un espacio de silencio y contemplación.\n\n## El rol del CCAM\n\nEl Centro Cultural Argentino de Montaña (CCAM) lleva más de 22 años promoviendo la cultura de montaña segura y responsable. CumbreCert nace de ese trabajo.\n\n## Resumen\n\n- El senderismo tiene una historia rica en Argentina\n- La montaña es un espacio compartido que debemos cuidar\n- La ética del senderista: no dejar rastro, respetar la fauna, considerar a otros\n- Certificarse es una forma de comprometerse con estos valores`,
  },
  {
    id: 2,
    title: "¿Qué llevar? Equipamiento esencial",
    subtitle: "Mochila, calzado, hidratación y nutrición",
    duration: "25 min",
    content: `# Módulo 2: ¿Qué llevar? Equipamiento esencial\n\n## Las 10 esenciales del senderista\n\nToda salida a la montaña requiere llevar los elementos básicos de seguridad:\n\n1. **Navegación:** Mapa topográfico, brújula, GPS offline\n2. **Protección solar:** FPS 50+, anteojos UV, sombrero\n3. **Aislamiento térmico:** Ropa de abrigo extra, capa impermeable\n4. **Iluminación:** Linterna frontal con pilas de repuesto\n5. **Primeros auxilios:** Kit básico, medicación personal\n6. **Fuego:** Encendedor (solo para emergencias)\n7. **Herramientas:** Navaja multiuso, cinta adhesiva\n8. **Nutrición:** Comida extra para un día adicional\n9. **Hidratación:** Mínimo 2 litros por persona\n10. **Refugio de emergencia:** Manta de supervivencia\n\n## Calzado: la decisión más importante\n\n**Para senderos marcados:** Zapatillas trail running o botas bajas\n**Para trekking de varios días:** Botas medianas/altas con tobillo reforzado\n**Nunca usar:** Zapatillas urbanas, sandalias, botas de lluvia de goma\n\n## Mochila: tamaño y distribución\n\n- **Día:** 20-30 litros\n- **Fin de semana:** 40-50 litros\n- **Travesía:** 60-80 litros\n- Peso máximo: 20-25% de tu peso corporal\n- Lo más pesado: cerca de la espalda y arriba\n\n## Resumen\n\n- Las 10 esenciales son obligatorias en toda salida\n- El calzado adecuado previene la mayoría de los accidentes\n- Hidratación mínima: 2 litros; en altura o calor, más\n- Peso máximo de mochila: 20-25% de tu peso corporal`,
  },
  {
    id: 3,
    title: "Clima y meteorología de montaña",
    subtitle: "Cómo leer el tiempo y cuándo no salir",
    duration: "20 min",
    content: `# Módulo 3: Clima y meteorología de montaña\n\n## Por qué el clima de montaña es diferente\n\nLa montaña genera su propio microclima. Los cambios pueden ser extremadamente rápidos y violentos.\n\n**Regla de oro:** Por cada 1000 metros de altitud, la temperatura baja entre 6°C y 10°C.\n\n## Las amenazas climáticas principales\n\n### Tormenta eléctrica\nEs la amenaza más peligrosa. Señales: cielo que se oscurece desde el oeste, viento que cambia de dirección, cumulonimbos, cabello que se eriza.\n\n**Qué hacer:** Descender de cimas y crestas, alejarse de árboles aislados y agua.\n\n### Hipotermia\nOcurre cuando la temperatura corporal baja de 35°C. Puede ocurrir con 10°C si hay viento y humedad.\n\n**Síntomas:** Temblores, confusión mental, torpeza, somnolencia.\n\n## Cómo leer el pronóstico\n\n**Fuentes confiables:** SMN (smn.gob.ar), Windy.com, Mountain-forecast.com\n\n**Qué revisar:** Precipitación, viento en altura, temperatura mínima, probabilidad de tormenta.\n\n## La regla del retorno\n\nSi salís a las 8am, debés estar de regreso en la cima antes del mediodía.\n\n**Nunca subas si:** El pronóstico indica tormentas en las próximas 6 horas, hay nubes que cubren la cumbre, visibilidad menor a 100 metros.\n\n## Resumen\n\n- La temperatura baja 6-10°C por cada 1000m\n- Las tormentas eléctricas son la principal amenaza\n- Consultá siempre el SMN antes de salir\n- Regla del retorno: en la cima antes del mediodía`,
  },
  {
    id: 4,
    title: "Orientación y señalización",
    subtitle: "Cómo no perderse y qué hacer si te perdés",
    duration: "25 min",
    content: `# Módulo 4: Orientación y señalización\n\n## Los sistemas de señalización en Argentina\n\n### Cairns (hitos de piedra)\nAcumulaciones de piedras que marcan el camino. Son el sistema más común en la Patagonia.\n\n**Reglas:** Nunca muevas un cairn. Si encontrás uno caído, levantalo.\n\n### Marcas en árboles y rocas\n- **Rojo:** Sendero principal\n- **Amarillo:** Sendero secundario\n- **Azul:** Acceso a refugio\n\n## Orientación con mapa y brújula\n\nLas curvas de nivel representan la forma del terreno:\n- Curvas juntas = pendiente empinada\n- Curvas separadas = terreno suave\n- Escala más común en Argentina: 1:50.000 (1cm = 500m)\n\n## Aplicaciones GPS recomendadas (offline)\n\n- **Wikiloc:** Rutas de la comunidad\n- **Maps.me:** Mapas offline con senderos\n- **Gaia GPS:** Mapas topográficos detallados\n\n**Importante:** Descargá los mapas ANTES de salir.\n\n## ¿Qué hacer si te perdés? Protocolo STOP\n\n1. **S - Stop (Parate):** No sigas caminando\n2. **T - Think (Pensá):** ¿Cuándo estabas seguro del camino?\n3. **O - Observe (Observá):** Mirá el terreno, el sol, las marcas\n4. **P - Plan (Planificá):** Decidí una acción concreta\n\n**Si no podés orientarte:** Quedáte en el lugar. 3 señales = pedido de socorro.\n\n## Resumen\n\n- Respetá y no muevas los cairns\n- Llevá mapa impreso + brújula + GPS offline\n- Si te perdés: STOP\n- 3 señales = pedido de socorro`,
  },
  {
    id: 5,
    title: "Conducta en la montaña y Leave No Trace",
    subtitle: "Cómo cuidar el entorno y convivir con otros",
    duration: "20 min",
    content: `# Módulo 5: Conducta en la montaña y Leave No Trace\n\n## Los 7 principios de Leave No Trace\n\n1. **Planificá y preparate** — Conocé las regulaciones, viajá en grupos pequeños\n2. **Caminá en superficies resistentes** — Usá senderos marcados, acampá a 60m del agua\n3. **Gestioná correctamente los residuos** — Todo lo que llevás, lo traés de vuelta\n4. **Dejá lo que encontrás** — No recojas flores, piedras ni artefactos\n5. **Minimizá el impacto del fuego** — En Argentina el fuego está prohibido en la mayoría de los parques\n6. **Respetá la vida silvestre** — 30 metros de distancia mínima, no alimentes animales\n7. **Sé considerado con otros** — Cedé el paso a quien sube y a animales de carga\n\n## Convivencia en refugios\n\n- Llegá antes de las 18hs\n- Reservá con anticipación en temporada alta\n- Respetá los horarios de silencio (22hs)\n- Pagá la tarifa correspondiente\n\n## Residuos orgánicos\n\n- Alejate 60m del agua, senderos y campamentos\n- Cavá un hoyo de 15-20cm (cathole)\n- El papel higiénico va en bolsa hermética y lo traés de vuelta\n\n## Resumen\n\n- Los 7 principios LNT son el estándar internacional\n- Todo residuo que llevás, lo traés de vuelta\n- El fuego está prohibido en la mayoría de los parques argentinos\n- Respetá la fauna: 30 metros de distancia mínima\n- Cedé el paso a quien sube y a animales de carga`,
  },
];

const NIVEL0_EXAMS: Record<number, { question: string; options: string[]; correct: number }[]> = {
  1: [
    { question: "¿Cuál es el primer principio ético del senderismo responsable?", options: ["Conquistar la cumbre a cualquier costo", "No dejar rastro (Leave No Trace)", "Ir siempre con guía certificado", "Llevar GPS obligatorio"], correct: 1 },
    { question: "¿Qué institución avala CumbreCert?", options: ["Club Andino Bariloche", "CCAM (Centro Cultural Argentino de Montaña)", "Parques Nacionales Argentina", "Ministerio de Turismo"], correct: 1 },
    { question: "¿Cuántos años lleva el CCAM promoviendo la cultura de montaña?", options: ["5 años", "10 años", "22 años", "50 años"], correct: 2 },
    { question: "La montaña como espacio compartido implica:", options: ["Que solo pueden acceder senderistas certificados", "Respetar a otros visitantes, fauna y comunidades locales", "Que el primero en llegar tiene prioridad", "Que se puede acampar en cualquier lugar"], correct: 1 },
    { question: "¿Qué significa 'Leave No Trace'?", options: ["Dejar huellas para que otros puedan seguirte", "No dejar rastro de tu paso por la naturaleza", "Usar solo senderos marcados", "Llevar ropa de colores neutros"], correct: 1 },
  ],
  2: [
    { question: "¿Cuántos litros de agua mínimo debe llevar cada persona en una salida de día?", options: ["0.5 litros", "1 litro", "2 litros", "5 litros"], correct: 2 },
    { question: "¿Qué porcentaje máximo de tu peso corporal debe pesar la mochila?", options: ["10%", "20-25%", "40%", "50%"], correct: 1 },
    { question: "¿Cuál es el calzado INCORRECTO para senderismo?", options: ["Botas de trekking con tobillo reforzado", "Zapatillas trail running", "Zapatillas de deporte urbanas", "Botas con suela Vibram"], correct: 2 },
    { question: "¿Qué elemento de las 10 esenciales NO debe faltar para emergencias nocturnas?", options: ["Cámara de fotos", "Linterna frontal con pilas de repuesto", "Mapa de la ciudad", "Auriculares"], correct: 1 },
    { question: "¿Dónde deben ir los elementos más pesados de la mochila?", options: ["En el fondo, lo más lejos posible de la espalda", "Cerca de la espalda y arriba", "En los bolsillos laterales", "No importa la distribución"], correct: 1 },
  ],
  3: [
    { question: "¿Cuántos grados baja la temperatura por cada 1000 metros de altitud?", options: ["1-2°C", "3-5°C", "6-10°C", "15-20°C"], correct: 2 },
    { question: "¿Cuál es la regla del retorno para evitar tormentas de tarde?", options: ["Estar de regreso en la cima antes de las 8am", "Estar en la cima antes del mediodía", "Llegar a la cumbre al atardecer", "No hay regla específica"], correct: 1 },
    { question: "¿Qué fuente es confiable para el pronóstico meteorológico en Argentina?", options: ["WhatsApp", "SMN (Servicio Meteorológico Nacional)", "Redes sociales", "El color del cielo solamente"], correct: 1 },
    { question: "¿Cuál es un síntoma de hipotermia?", options: ["Sudoración excesiva", "Temblores incontrolables y confusión mental", "Aumento de la temperatura corporal", "Hambre intensa"], correct: 1 },
    { question: "¿Cuándo NO debes salir a la montaña?", options: ["Cuando hay sol y viento leve", "Cuando el pronóstico indica tormentas en las próximas 6 horas", "Cuando la temperatura es de 15°C", "Cuando hay pocas nubes"], correct: 1 },
  ],
  4: [
    { question: "¿Qué significa el protocolo STOP cuando te perdés?", options: ["Saltar, Trepar, Observar, Pedir ayuda", "Parate, Pensá, Observá, Planificá", "Seguir, Trotar, Orientarse, Progresar", "Señalizar, Tomar agua, Orientarse, Protegerse"], correct: 1 },
    { question: "¿Cuántas señales internacionales equivalen a un pedido de socorro?", options: ["1 señal", "2 señales", "3 señales", "5 señales"], correct: 2 },
    { question: "¿Qué son los cairns?", options: ["Señales pintadas en árboles", "Acumulaciones de piedras que marcan el camino", "Carteles de parques nacionales", "Aplicaciones GPS"], correct: 1 },
    { question: "¿Qué escala es la más común en mapas topográficos de Argentina?", options: ["1:1.000", "1:10.000", "1:50.000", "1:1.000.000"], correct: 2 },
    { question: "Si te perdés, ¿qué es lo primero que debes hacer?", options: ["Correr en busca de señal de celular", "Parar y no seguir caminando", "Trepar al árbol más alto", "Encender una fogata"], correct: 1 },
  ],
  5: [
    { question: "¿A cuántos metros mínimo de fuentes de agua se debe acampar?", options: ["10 metros", "30 metros", "60 metros", "100 metros"], correct: 2 },
    { question: "¿Qué se debe hacer con los residuos orgánicos en la montaña?", options: ["Enterrarlos en cualquier lugar", "Quemarlos", "Usar cathole a 60m del agua y llevar el papel de vuelta", "Dejarlos cubiertos con hojas"], correct: 2 },
    { question: "¿Cuál es la distancia mínima recomendada para observar mamíferos silvestres?", options: ["5 metros", "15 metros", "30 metros", "100 metros"], correct: 2 },
    { question: "¿A quién se le cede el paso en un sendero?", options: ["A quien baja (tiene prioridad)", "A quien sube (tiene prioridad) y a animales de carga", "Al grupo más grande", "No hay reglas de paso"], correct: 1 },
    { question: "¿Por qué NO se deben alimentar animales silvestres?", options: ["Porque pueden atacarte", "Porque los hace dependientes del humano y altera su comportamiento natural", "Porque está prohibido por ley en todos los casos", "Porque pueden tener enfermedades"], correct: 1 },
  ],
};

const FINAL_EXAM_QUESTIONS = [
  { question: "¿Cuál es el principio fundamental de Leave No Trace?", options: ["Conquistar la cumbre siempre", "No dejar rastro de tu paso por la naturaleza", "Ir siempre en grupo grande", "Llevar guía obligatorio"], correct: 1 },
  { question: "¿Cuántos litros de agua mínimo se necesitan por persona en una salida de día?", options: ["0.5 litros", "1 litro", "2 litros", "4 litros"], correct: 2 },
  { question: "¿Cuántos grados baja la temperatura por cada 1000m de altitud?", options: ["1-2°C", "3-5°C", "6-10°C", "20°C"], correct: 2 },
  { question: "¿Qué significa la 'S' del protocolo STOP?", options: ["Señalizar", "Subir", "Parate (Stop)", "Seguir"], correct: 2 },
  { question: "¿Cuántas señales internacionales equivalen a un pedido de socorro?", options: ["1", "2", "3", "5"], correct: 2 },
  { question: "¿A cuántos metros mínimo de fuentes de agua se debe acampar?", options: ["10m", "30m", "60m", "200m"], correct: 2 },
  { question: "¿Cuál es el calzado INCORRECTO para senderismo?", options: ["Botas de trekking", "Trail running", "Zapatillas urbanas", "Botas con suela Vibram"], correct: 2 },
  { question: "¿Qué fuente es confiable para el pronóstico meteorológico en Argentina?", options: ["WhatsApp", "SMN (smn.gob.ar)", "Redes sociales", "El color del cielo"], correct: 1 },
  { question: "¿Qué son los cairns?", options: ["Señales pintadas en árboles", "Acumulaciones de piedras que marcan el camino", "Carteles de parques", "Apps GPS"], correct: 1 },
  { question: "¿Por qué NO se deben alimentar animales silvestres?", options: ["Porque atacan", "Porque los hace dependientes del humano", "Porque está siempre prohibido por ley", "Porque tienen enfermedades"], correct: 1 },
];

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
        if (input.level !== 0) throw new TRPCError({ code: "NOT_FOUND", message: "Nivel no disponible aún." });
        const progress = await db.getModuleProgress(ctx.user.id, 0);
        const progressMap = Object.fromEntries(progress.map((p) => [p.moduleNumber, p]));
        return NIVEL0_MODULES.map((m) => ({ ...m, progress: progressMap[m.id] ?? null }));
      }),

    getModule: protectedProcedure
      .input(z.object({ level: z.number(), moduleNumber: z.number() }))
      .query(async ({ input, ctx }) => {
        if (input.level !== 0) throw new TRPCError({ code: "NOT_FOUND" });
        const mod = NIVEL0_MODULES.find((m) => m.id === input.moduleNumber);
        if (!mod) throw new TRPCError({ code: "NOT_FOUND" });
        if (input.moduleNumber > 1) {
          const prev = await db.getModuleProgressEntry(ctx.user.id, 0, input.moduleNumber - 1);
          if (!prev || !prev.passed) throw new TRPCError({ code: "FORBIDDEN", message: "Debés aprobar el módulo anterior primero." });
        }
        const progress = await db.getModuleProgressEntry(ctx.user.id, 0, input.moduleNumber);
        return { ...mod, progress };
      }),

    getExamQuestions: protectedProcedure
      .input(z.object({ level: z.number(), moduleNumber: z.number() }))
      .query(async ({ input, ctx }) => {
        if (input.level !== 0) throw new TRPCError({ code: "NOT_FOUND" });
        if (input.moduleNumber === 6) {
          for (let i = 1; i <= 5; i++) {
            const p = await db.getModuleProgressEntry(ctx.user.id, 0, i);
            if (!p || !p.passed) throw new TRPCError({ code: "FORBIDDEN", message: `Debés aprobar el Módulo ${i} primero.` });
          }
          return FINAL_EXAM_QUESTIONS.map((q) => ({ question: q.question, options: q.options }));
        }
        if (input.moduleNumber > 1) {
          const prev = await db.getModuleProgressEntry(ctx.user.id, 0, input.moduleNumber - 1);
          if (!prev || !prev.passed) throw new TRPCError({ code: "FORBIDDEN", message: "Debés aprobar el módulo anterior primero." });
        }
        const questions = NIVEL0_EXAMS[input.moduleNumber];
        if (!questions) throw new TRPCError({ code: "NOT_FOUND" });
        return questions.map((q) => ({ question: q.question, options: q.options }));
      }),

    submitExam: protectedProcedure
      .input(z.object({ level: z.number(), moduleNumber: z.number(), answers: z.array(z.number()) }))
      .mutation(async ({ input, ctx }) => {
        if (input.level !== 0) throw new TRPCError({ code: "NOT_FOUND" });
        let questions: { question: string; options: string[]; correct: number }[];
        if (input.moduleNumber === 6) {
          questions = FINAL_EXAM_QUESTIONS;
        } else {
          questions = NIVEL0_EXAMS[input.moduleNumber];
          if (!questions) throw new TRPCError({ code: "NOT_FOUND" });
        }
        let correct = 0;
        for (let i = 0; i < questions.length; i++) {
          if (input.answers[i] === questions[i].correct) correct++;
        }
        const score = Math.round((correct / questions.length) * 100);
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
        if (input.moduleNumber === 6 && passed) {
          const existingCert = (await db.getCertificatesByUser(ctx.user.id)).find((c) => c.courseLevel === 0);
          if (!existingCert) {
            const qrCode = `CC0-${nanoid(12).toUpperCase()}`;
            const expiresAt = new Date();
            expiresAt.setFullYear(expiresAt.getFullYear() + 2);
            certificate = await db.createCertificate({ userId: ctx.user.id, qrCode, courseLevel: 0, finalScore: score, expiresAt, isValid: 1 });
            const cp = await db.getCourseProgress(ctx.user.id);
            await db.upsertCourseProgress({ userId: ctx.user.id, nivel0Completado: 1, nivel1Completado: cp?.nivel1Completado ?? 0, nivel2Completado: cp?.nivel2Completado ?? 0, nivel3Completado: cp?.nivel3Completado ?? 0 });
          } else {
            certificate = existingCert;
          }
        }
        return { score, passed, correct, total: questions.length, certificate };
      }),

    getProgress: protectedProcedure.query(async ({ ctx }) => {
      const courseProgressData = await db.ensureCourseProgress(ctx.user.id);
      const moduleProgressData = await db.getModuleProgress(ctx.user.id, 0);
      const certificates = await db.getCertificatesByUser(ctx.user.id);
      return { courseProgress: courseProgressData, moduleProgress: moduleProgressData, certificates };
    }),
  }),

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
