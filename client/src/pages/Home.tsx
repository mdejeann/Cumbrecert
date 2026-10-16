import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { LeadDialog, type LeadInterest } from "@/components/LeadDialog";
import {
  ArrowRight, Award, BookOpen, Building2, Check, ChevronDown, Compass, Heart, Menu, MessageSquare,
  Mail, Mountain, Move3d, QrCode, ShieldCheck, Sparkles, Star, Users, X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";

/**
 * CumbreCert — Landing orientada a conversión.
 * - El catálogo sale de la base (trpc.catalog): cada curso nuevo aparece solo.
 * - Los formularios guardan leads reales (newsletter, colaboración, clubes, guías).
 * - Planes sin precios visibles: gratis / colaboración / a medida.
 */

const HERO_IMG =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663469351135/mDv3jUPJokU654taR8cMEm/hero-mountain-sunrise-WE4bkKxENCbSciy5hmXNaZ.webp";
const TESTIMONIALS_BG =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663469351135/mDv3jUPJokU654taR8cMEm/community-testimonials-bg-kgtuYqj8gyy8cWHPJTpfmL.webp";

// Cursos en preparación: generan lista de espera hasta que existan en la base
const UPCOMING = [
  { nivel: 3, titulo: "Trekker Avanzado", descripcion: "Navegación GPS, travesías de varios días, condiciones extremas y rescate básico." },
  { nivel: 4, titulo: "Montaña Responsable", descripcion: "Alta montaña, gestión de grupos y preparación para guía profesional." },
];

const FAQ = [
  { q: "¿Cuánto cuesta?", a: "El Nivel 0 es gratis para siempre. El resto de los cursos se sostienen con un esquema de colaboración: aportás lo que podés y eso financia contenidos nuevos y certificaciones verificables." },
  { q: "¿Es oficial? ¿Los parques lo aceptan?", a: "CumbreCert cuenta con el respaldo del CCAM y guías certificados AAGM. Estamos en proceso de acuerdos con administraciones de parques provinciales y nacionales; cada acuerdo nuevo se comunica en la web." },
  { q: "¿Cómo es la práctica de nudos en 3D?", a: "En el Curso de Nudos movés una soga real en 3D con el mouse o el dedo: la pasás por detrás del mosquetón girando la cámara, armás el ocho, el dinámico y el ballestrinque y al final la ajustás tirando del chicote." },
  { q: "¿El certificado vence?", a: "Sí, tiene una vigencia de 2 años y se renueva con una evaluación de actualización. Así el certificado refleja conocimiento real y vigente." },
  { q: "¿Cómo se verifica un certificado?", a: "Cada certificado tiene un código QR único. Cualquier guardaparque, guía o refugio puede escanearlo o cargar el código en cumbrecert para ver si es válido." },
  { q: "¿Puedo hacerlo desde el celular?", a: "Sí, todo el sitio y las prácticas funcionan en el celular. Tu progreso queda guardado." },
  { q: "Tengo un club, agencia o empresa. ¿Puedo certificar a mi gente?", a: "Sí. Armamos propuestas para grupos con seguimiento del avance de cada integrante y certificados a nombre de tu organización. Pedí una propuesta desde la sección Planes." },
];

const TESTIMONIALS = [
  { text: "Siempre me pareció injusto pagar un guía en una ruta que conozco de memoria. Con CumbreCert pude demostrar que sé lo que hago y subir solo.", author: "Martín R.", location: "Senderista — Bariloche" },
  { text: "Vengo de Alemania al Aconcagua hace tres años. Este año usé mi certificado CumbreCert y fue otra experiencia.", author: "Anna S.", location: "Trekker — München / Mendoza" },
  { text: "Los grupos que me contratan ahora llegan con conocimiento base. No pierdo tiempo explicando qué calzado poner. Lo recomiendo a todos mis clientes.", author: "Gustavo L.", location: "Guía certificado — El Chaltén" },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5 },
};

export default function Home() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [lead, setLead] = useState<{ interes: LeadInterest; contexto?: string } | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [newsletter, setNewsletter] = useState({ email: "", region: "" });
  const [newsletterSent, setNewsletterSent] = useState(false);

  const { data: catalog } = trpc.catalog.useQuery();
  const subscribe = trpc.leads.create.useMutation({ onSuccess: () => setNewsletterSent(true) });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };
  const startHref = user ? "/dashboard" : "/register";
  const courses = (catalog ?? []).slice().sort((a, b) => a.nivel - b.nivel);
  const upcoming = UPCOMING.filter((u) => !courses.some((c) => c.nivel === u.nivel));

  const NAV = [
    ["cursos", "Cursos"],
    ["practica-3d", "Práctica 3D"],
    ["planes", "Planes"],
    ["verificar", "Verificar"],
    ["faq", "Preguntas"],
  ] as const;

  return (
    <div className="min-h-screen bg-white text-[#2D2D2D]">
      {/* ============ NAV ============ */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all ${
          scrolled ? "bg-white/95 backdrop-blur shadow-sm" : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className={`flex items-center gap-2 font-bold text-lg ${scrolled ? "text-[#1B5E20]" : "text-white"}`}>
            <span className="w-8 h-8 rounded-full bg-[#1B5E20] flex items-center justify-center">
              <Mountain className="w-4 h-4 text-white" />
            </span>
            CumbreCert
          </Link>
          <div className="hidden md:flex items-center gap-7">
            {NAV.map(([id, label]) => (
              <button
                key={id}
                onClick={() => go(id)}
                className={`text-sm font-medium transition ${scrolled ? "text-gray-600 hover:text-[#1B5E20]" : "text-white/85 hover:text-white"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            {!user && (
              <Link href="/login" className={`text-sm font-semibold ${scrolled ? "text-[#1B5E20]" : "text-white"}`}>
                Ingresar
              </Link>
            )}
            <Link
              href={startHref}
              className="text-sm font-semibold bg-[#8BC34A] hover:bg-[#7CB342] text-[#10331A] px-4 py-2 rounded-full transition"
            >
              {user ? "Mi panel" : "Empezá gratis"}
            </Link>
          </div>
          <button className={`md:hidden ${scrolled ? "text-[#1B5E20]" : "text-white"}`} onClick={() => setMenuOpen(!menuOpen)} aria-label="Menú">
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1 shadow-lg">
            {NAV.map(([id, label]) => (
              <button key={id} onClick={() => go(id)} className="block w-full text-left py-2 text-gray-700">
                {label}
              </button>
            ))}
            <Link href={startHref} className="block text-center mt-2 bg-[#1B5E20] text-white font-semibold py-2.5 rounded-lg">
              {user ? "Mi panel" : "Empezá gratis"}
            </Link>
          </div>
        )}
      </nav>

      {/* ============ HERO ============ */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        <img src={HERO_IMG} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b2410]/90 via-[#0b2410]/60 to-black/20" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 pt-24 pb-16 grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center w-full">
          <div className="text-white">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-medium mb-6"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#8BC34A]" /> Nuevo: Curso de Nudos con práctica 3D
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] mb-5"
            >
              Aprendé montaña.
              <br />
              <span className="text-[#AED581]">Certificá lo que sabés.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-white/85 max-w-xl mb-8"
            >
              Cursos online de senderismo y montañismo con evaluación, práctica interactiva y un certificado digital con QR que
              cualquiera puede verificar. Respaldado por el CCAM y guías certificados.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row gap-3">
              <Link
                href={startHref}
                className="inline-flex items-center justify-center gap-2 bg-[#8BC34A] hover:bg-[#9CCC65] text-[#10331A] font-bold px-7 py-3.5 rounded-full transition shadow-lg shadow-black/20"
              >
                {user ? "Seguir aprendiendo" : "Empezá gratis — Nivel 0"} <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => go("cursos")}
                className="inline-flex items-center justify-center gap-2 border border-white/40 hover:bg-white/10 text-white font-semibold px-7 py-3.5 rounded-full transition"
              >
                Ver cursos
              </button>
            </motion.div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-8 text-sm text-white/80">
              {["100% online y a tu ritmo", "Certificado con QR", "Vigencia de 2 años"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#8BC34A]" /> {t}
                </span>
              ))}
            </div>
          </div>

          {/* Certificado de ejemplo */}
          <motion.div
            initial={{ opacity: 0, y: 30, rotate: 2 }}
            animate={{ opacity: 1, y: 0, rotate: -2 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="hidden lg:block"
          >
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm ml-auto">
              <div className="flex items-center justify-between mb-5">
                <span className="flex items-center gap-2 font-bold text-[#1B5E20]">
                  <Mountain className="w-5 h-5" /> CumbreCert
                </span>
                <span className="text-[10px] font-bold tracking-widest text-[#689F38] bg-[#F1F8E9] px-2 py-1 rounded">VÁLIDO</span>
              </div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Certificado de</p>
              <p className="text-2xl font-bold text-[#1B5E20] leading-tight mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                Nudos de Montaña
              </p>
              <p className="text-sm text-gray-500 mb-5">Nivel 2 · Ocho, dinámico y ballestrinque</p>
              <div className="flex items-end justify-between">
                <div className="text-xs text-gray-500 space-y-1">
                  <p><b className="text-gray-700">Puntaje:</b> 96%</p>
                  <p><b className="text-gray-700">Vence:</b> 2028</p>
                  <p className="font-mono text-[11px]">CC2-8F3KQ1ZP7A</p>
                </div>
                <div className="w-20 h-20 rounded-lg bg-[#1B5E20] p-2 grid grid-cols-5 gap-0.5">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <span key={i} className={`rounded-[1px] ${[0, 1, 3, 5, 7, 9, 11, 12, 14, 16, 18, 20, 21, 23, 24].includes(i) ? "bg-white" : ""}`} />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        <button onClick={() => go("respaldo")} className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 animate-bounce" aria-label="Bajar">
          <ChevronDown className="w-7 h-7" />
        </button>
      </section>

      {/* ============ RESPALDO + MÉTRICAS ============ */}
      <section id="respaldo" className="bg-[#F1F8E9] border-b border-[#DCEDC8]">
        <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-[auto_1fr] gap-8 items-center">
          <div className="flex items-center gap-6 justify-center">
            <span className="text-xs font-semibold tracking-widest text-[#689F38]">CON EL RESPALDO DE</span>
            <img src="/ccam-logo.png" alt="CCAM" className="h-10" />
            <span className="font-bold text-[#1B5E20]">AAGM</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            {[
              ["+1.200", "senderistas certificados"],
              ["4,9/5", "valoración de alumnos"],
              ["2 años", "de vigencia"],
              ["24/7", "verificación por QR"],
            ].map(([n, l]) => (
              <div key={l}>
                <p className="text-2xl font-bold text-[#1B5E20]">{n}</p>
                <p className="text-xs text-gray-500">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CATÁLOGO ============ */}
      <section id="cursos" className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-bold tracking-widest text-[#689F38] mb-2">CURSOS</p>
            <h2 className="text-3xl md:text-5xl font-bold text-[#1B5E20] mb-4">Un camino de certificación, paso a paso</h2>
            <p className="text-gray-600">Empezá gratis y avanzá a tu ritmo. Cada curso termina con un examen y un certificado verificable.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((c) => {
              const isNudos = c.nivel === 2;
              return (
                <motion.div
                  {...fadeUp}
                  key={c.nivel}
                  className={`relative flex flex-col rounded-2xl border p-6 bg-white transition hover:-translate-y-1 hover:shadow-xl ${
                    isNudos ? "border-[#8BC34A] shadow-[0_20px_45px_-28px_rgba(27,94,32,0.9)]" : "border-[#E8F5E9] shadow-sm"
                  }`}
                >
                  {isNudos && (
                    <span className="absolute -top-3 left-6 text-[11px] font-bold bg-[#8BC34A] text-[#10331A] px-3 py-1 rounded-full flex items-center gap-1">
                      <Move3d className="w-3 h-3" /> NUEVO · PRÁCTICA 3D
                    </span>
                  )}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold tracking-widest text-[#689F38]">NIVEL {c.nivel}</span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                        c.nivel === 0 ? "bg-[#8BC34A] text-[#10331A]" : "bg-[#F1F8E9] text-[#1B5E20]"
                      }`}
                    >
                      {c.nivel === 0 ? "GRATIS" : "COLABORACIÓN"}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-[#1B5E20] mb-2">{c.titulo.replace(/^Nivel \d+ — /, "")}</h3>
                  <p className="text-sm text-gray-600 mb-5 flex-1">{c.descripcion}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-5">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" /> {c.modulos} módulos
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" /> Certificado QR
                    </span>
                  </div>
                  <Link
                    href={startHref}
                    className={`text-center font-semibold py-2.5 rounded-lg transition ${
                      isNudos ? "bg-[#1B5E20] hover:bg-[#2E7D32] text-white" : "border border-[#C8E6C9] text-[#1B5E20] hover:bg-[#F1F8E9]"
                    }`}
                  >
                    {c.nivel === 0 ? "Empezar gratis" : "Inscribirme"}
                  </Link>
                </motion.div>
              );
            })}
            {upcoming.map((u) => (
              <motion.div {...fadeUp} key={u.nivel} className="flex flex-col rounded-2xl border border-dashed border-[#C8E6C9] p-6 bg-[#FAFCF8]">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold tracking-widest text-gray-400">NIVEL {u.nivel}</span>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">PRÓXIMAMENTE</span>
                </div>
                <h3 className="text-xl font-bold text-gray-500 mb-2">{u.titulo}</h3>
                <p className="text-sm text-gray-500 mb-5 flex-1">{u.descripcion}</p>
                <button
                  onClick={() => setLead({ interes: "newsletter", contexto: `Lista de espera: ${u.titulo}` })}
                  className="text-center font-semibold py-2.5 rounded-lg border border-[#C8E6C9] text-[#1B5E20] hover:bg-[#F1F8E9]"
                >
                  Avisame cuando abra
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PRÁCTICA 3D ============ */}
      <section id="practica-3d" className="bg-[#0f2b14] text-white py-20 md:py-28 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div {...fadeUp}>
            <p className="text-xs font-bold tracking-widest text-[#AED581] mb-2">APRENDER HACIENDO</p>
            <h2 className="text-3xl md:text-5xl font-bold mb-5">Armá los nudos con una soga real en 3D</h2>
            <p className="text-white/75 mb-8">
              No alcanza con leer. En el Curso de Nudos tomás el chicote, girás la cámara para pasar la cuerda por detrás del
              mosquetón y la ajustás tirando, como en la pared. Si el nudo no está bien hecho, no avanzás.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                "Soga trenzada con física y colisiones",
                "Ocho, dinámico (UIAA) y ballestrinque",
                "Funciona en la compu y en el celular",
                "Es parte del examen para certificar",
              ].map((t) => (
                <li key={t} className="flex items-center gap-3 text-white/90">
                  <span className="w-6 h-6 rounded-full bg-[#8BC34A]/20 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-[#AED581]" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
            <Link href={startHref} className="inline-flex items-center gap-2 bg-[#8BC34A] hover:bg-[#9CCC65] text-[#10331A] font-bold px-6 py-3 rounded-full">
              Probar el Curso de Nudos <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
          <motion.div {...fadeUp} className="relative">
            <div className="aspect-[4/3] rounded-3xl bg-gradient-to-br from-[#1B5E20] to-[#0b2410] border border-white/10 p-8 flex items-center justify-center relative overflow-hidden">
              <svg viewBox="0 0 300 220" className="w-full h-full">
                <defs>
                  <linearGradient id="metal" x1="0" x2="1">
                    <stop offset="0" stopColor="#94a3b8" />
                    <stop offset="0.5" stopColor="#f1f5f9" />
                    <stop offset="1" stopColor="#64748b" />
                  </linearGradient>
                  <pattern id="braid" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                    <rect width="8" height="8" fill="#e8601c" />
                    <rect width="4" height="8" fill="#c2410c" />
                  </pattern>
                </defs>
                <path d="M150 20 C120 20 115 50 115 80 L115 160 C115 195 140 205 160 200 C190 195 195 170 195 150 L200 70 C202 40 185 20 150 20 Z" fill="none" stroke="url(#metal)" strokeWidth="9" />
                <rect x="192" y="70" width="14" height="40" rx="3" fill="#d4a017" />
                <path d="M10 210 C60 190 90 160 112 140 C130 125 128 110 112 104 C96 98 98 84 116 82 C134 80 134 66 116 62 C100 58 104 44 122 46" fill="none" stroke="url(#braid)" strokeWidth="11" strokeLinecap="round" />
                <path d="M118 120 C140 130 150 160 170 210" fill="none" stroke="url(#braid)" strokeWidth="11" strokeLinecap="round" />
              </svg>
              <span className="absolute bottom-4 left-4 text-xs bg-white/10 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <Move3d className="w-3.5 h-3.5" /> Girá · Arrastrá · Ajustá
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ CÓMO FUNCIONA ============ */}
      <section id="como-funciona" className="py-20 md:py-28 bg-[#F8FAF5]">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div {...fadeUp} className="text-center mb-14">
            <p className="text-xs font-bold tracking-widest text-[#689F38] mb-2">CÓMO FUNCIONA</p>
            <h2 className="text-3xl md:text-5xl font-bold text-[#1B5E20]">De cero a certificado en cuatro pasos</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Users, t: "Creá tu cuenta", d: "Gratis, en un minuto. Arrancás por el Nivel 0." },
              { icon: BookOpen, t: "Estudiá a tu ritmo", d: "Módulos cortos con material de guías y del CCAM." },
              { icon: Compass, t: "Practicá y rendí", d: "Exámenes por módulo y práctica interactiva." },
              { icon: QrCode, t: "Obtené tu QR", d: "Certificado digital verificable por cualquiera." },
            ].map(({ icon: Icon, t, d }, i) => (
              <motion.div {...fadeUp} key={t} className="bg-white rounded-2xl p-6 border border-[#E8F5E9] relative">
                <span className="absolute top-5 right-5 text-4xl font-bold text-[#F1F8E9]">{i + 1}</span>
                <span className="w-11 h-11 rounded-xl bg-[#1B5E20] flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-white" />
                </span>
                <h3 className="font-bold text-[#1B5E20] mb-1">{t}</h3>
                <p className="text-sm text-gray-600">{d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PLANES ============ */}
      <section id="planes" className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-bold tracking-widest text-[#689F38] mb-2">PLANES</p>
            <h2 className="text-3xl md:text-5xl font-bold text-[#1B5E20] mb-4">Para cada tipo de montañista</h2>
            <p className="text-gray-600">Aprender lo básico es gratis. Con tu colaboración sostenemos nuevos cursos y certificaciones.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {[
              {
                icon: Mountain,
                name: "Explorador",
                tag: "Gratis",
                desc: "Para dar tus primeros pasos con seguridad.",
                items: ["Nivel 0 completo", "Examen y certificado QR", "Progreso guardado"],
                cta: user ? "Ir a mi panel" : "Crear cuenta gratis",
                action: () => navigate(startHref),
                featured: false,
              },
              {
                icon: Heart,
                name: "Colaborador",
                tag: "Colaboración",
                desc: "Acceso a todos los cursos y prácticas 3D.",
                items: ["Todos los niveles disponibles", "Prácticas interactivas 3D", "Certificados QR verificables", "Acceso anticipado a cursos nuevos"],
                cta: "Quiero colaborar",
                action: () => setLead({ interes: "colaborar" }),
                featured: true,
              },
              {
                icon: Building2,
                name: "Clubes y empresas",
                tag: "A medida",
                desc: "Certificá a tu equipo, socios o clientes.",
                items: ["Panel de seguimiento grupal", "Certificados a nombre de tu organización", "Contenidos adaptados", "Soporte prioritario"],
                cta: "Pedir propuesta",
                action: () => setLead({ interes: "clubes" }),
                featured: false,
              },
            ].map(({ icon: Icon, ...p }) => (
              <motion.div
                {...fadeUp}
                key={p.name}
                className={`rounded-2xl p-7 flex flex-col ${
                  p.featured ? "bg-[#1B5E20] text-white shadow-2xl md:-translate-y-3" : "bg-white border border-[#E8F5E9] shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${p.featured ? "bg-white/15" : "bg-[#F1F8E9]"}`}>
                    <Icon className={`w-5 h-5 ${p.featured ? "text-[#AED581]" : "text-[#1B5E20]"}`} />
                  </span>
                  {p.featured && <span className="text-[11px] font-bold bg-[#8BC34A] text-[#10331A] px-2.5 py-1 rounded-full">RECOMENDADO</span>}
                </div>
                <h3 className={`text-2xl font-bold ${p.featured ? "text-white" : "text-[#1B5E20]"}`}>{p.name}</h3>
                <p className={`text-3xl font-bold my-3 ${p.featured ? "text-[#AED581]" : "text-[#2E7D32]"}`}>{p.tag}</p>
                <p className={`text-sm mb-6 ${p.featured ? "text-white/75" : "text-gray-600"}`}>{p.desc}</p>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {p.items.map((it) => (
                    <li key={it} className="flex items-start gap-2 text-sm">
                      <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${p.featured ? "text-[#AED581]" : "text-[#8BC34A]"}`} />
                      {it}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={p.action}
                  className={`font-semibold py-3 rounded-full transition ${
                    p.featured ? "bg-[#8BC34A] hover:bg-[#9CCC65] text-[#10331A]" : "border border-[#C8E6C9] text-[#1B5E20] hover:bg-[#F1F8E9]"
                  }`}
                >
                  {p.cta}
                </button>
              </motion.div>
            ))}
          </div>

          {/* Programa de partners */}
          <motion.div {...fadeUp} className="mt-10 rounded-2xl bg-[#F1F8E9] border border-[#DCEDC8] p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 justify-between">
            <div className="flex items-start gap-4">
              <span className="w-12 h-12 rounded-xl bg-white flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-6 h-6 text-[#1B5E20]" />
              </span>
              <div>
                <h3 className="text-xl font-bold text-[#1B5E20]">¿Sos guía, refugio o agencia?</h3>
                <p className="text-sm text-gray-600">
                  Sumate al programa de partners: aparecé en el directorio, recomendá CumbreCert a tus clientes y dictá los niveles avanzados.
                </p>
              </div>
            </div>
            <button
              onClick={() => setLead({ interes: "guias" })}
              className="flex-shrink-0 bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-semibold px-6 py-3 rounded-full"
            >
              Quiero ser partner
            </button>
          </motion.div>
        </div>
      </section>

      {/* ============ TESTIMONIOS ============ */}
      <section className="relative py-20 md:py-28 bg-cover bg-center" style={{ backgroundImage: `url('${TESTIMONIALS_BG}')` }}>
        <div className="absolute inset-0 bg-[#0b2410]/85" />
        <div className="relative max-w-6xl mx-auto px-4">
          <motion.h2 {...fadeUp} className="text-3xl md:text-5xl font-bold text-white text-center mb-12">
            Lo que dice la comunidad
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <motion.div {...fadeUp} key={t.author} className="bg-white/95 rounded-2xl p-6">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#F9A825] text-[#F9A825]" />
                  ))}
                </div>
                <p className="text-gray-700 mb-5">“{t.text}”</p>
                <p className="font-bold text-[#1B5E20]">{t.author}</p>
                <p className="text-xs text-gray-500">{t.location}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ VERIFICAR ============ */}
      <section id="verificar" className="py-20 md:py-24">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div {...fadeUp}>
            <span className="w-14 h-14 rounded-2xl bg-[#F1F8E9] inline-flex items-center justify-center mb-5">
              <QrCode className="w-7 h-7 text-[#1B5E20]" />
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1B5E20] mb-3">Verificá un certificado</h2>
            <p className="text-gray-600 mb-8">Guardaparques, guías y refugios: ingresá el código que figura debajo del QR.</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (verifyCode.trim()) navigate(`/verificar/${encodeURIComponent(verifyCode.trim().toUpperCase())}`);
              }}
              className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
            >
              <input
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                placeholder="Ej: CC2-8F3KQ1ZP7A"
                className="flex-1 border border-[#C8E6C9] rounded-full px-5 py-3 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#8BC34A]"
              />
              <button className="bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-semibold px-7 py-3 rounded-full">Verificar</button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* ============ NEWSLETTER ============ */}
      <section className="pb-20 md:pb-24">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            {...fadeUp}
            className="rounded-3xl bg-gradient-to-br from-[#1B5E20] to-[#2E7D32] text-white p-8 md:p-12 grid md:grid-cols-2 gap-8 items-center"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-3">Salidas más seguras, en tu correo</h2>
              <p className="text-white/80">Consejos de montaña, novedades de cursos y aperturas de nuevos niveles. Una vez por mes.</p>
            </div>
            {newsletterSent ? (
              <p className="flex items-center gap-2 text-lg font-semibold">
                <Check className="w-6 h-6 text-[#AED581]" /> ¡Gracias! Ya estás en la lista.
              </p>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  subscribe.mutate({ email: newsletter.email, region: newsletter.region || undefined, interes: "newsletter" });
                }}
                className="flex flex-col gap-3"
              >
                <input
                  type="email"
                  required
                  value={newsletter.email}
                  onChange={(e) => setNewsletter({ ...newsletter, email: e.target.value })}
                  placeholder="tu@email.com"
                  className="rounded-full px-5 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#AED581]"
                />
                <select
                  value={newsletter.region}
                  onChange={(e) => setNewsletter({ ...newsletter, region: e.target.value })}
                  className="rounded-full px-5 py-3 text-gray-800 focus:outline-none"
                >
                  <option value="">¿Dónde caminás más? (opcional)</option>
                  {["Patagonia", "Cuyo / Aconcagua", "NOA", "Córdoba", "Buenos Aires / Sierras", "Otra"].map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
                <button disabled={subscribe.isPending} className="bg-[#8BC34A] hover:bg-[#9CCC65] text-[#10331A] font-bold py-3 rounded-full">
                  Suscribirme
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section id="faq" className="py-20 md:py-24 bg-[#F8FAF5]">
        <div className="max-w-3xl mx-auto px-4">
          <motion.h2 {...fadeUp} className="text-3xl md:text-5xl font-bold text-[#1B5E20] text-center mb-10">
            Preguntas frecuentes
          </motion.h2>
          <div className="space-y-3">
            {FAQ.map((f, i) => (
              <div key={f.q} className="bg-white rounded-xl border border-[#E8F5E9]">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 font-semibold text-[#1B5E20]"
                >
                  {f.q}
                  <ChevronDown className={`w-5 h-5 flex-shrink-0 transition ${expandedFaq === i ? "rotate-180" : ""}`} />
                </button>
                {expandedFaq === i && <p className="px-5 pb-5 text-gray-600 text-sm">{f.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA FINAL ============ */}
      <section className="py-20 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-bold text-[#1B5E20] mb-4">La cima siempre puede esperar. Tu preparación, no.</h2>
          <p className="text-gray-600 mb-8">Empezá hoy con el Nivel 0 gratuito.</p>
          <Link href={startHref} className="inline-flex items-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-bold px-8 py-4 rounded-full">
            {user ? "Ir a mi panel" : "Crear mi cuenta gratis"} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="bg-[#0b2410] text-white/70">
        <div className="max-w-6xl mx-auto px-4 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <p className="flex items-center gap-2 font-bold text-white text-lg mb-3">
              <Mountain className="w-5 h-5 text-[#8BC34A]" /> CumbreCert
            </p>
            <p className="text-sm">Subí libre, subí seguro. Certificación digital de senderismo y montañismo en Argentina.</p>
          </div>
          <div>
            <p className="font-semibold text-white mb-3">Plataforma</p>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => go("cursos")} className="hover:text-white">Cursos</button></li>
              <li><button onClick={() => go("practica-3d")} className="hover:text-white">Práctica 3D</button></li>
              <li><button onClick={() => go("verificar")} className="hover:text-white">Verificar certificado</button></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-white mb-3">Organizaciones</p>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => setLead({ interes: "clubes" })} className="hover:text-white">Clubes y empresas</button></li>
              <li><button onClick={() => setLead({ interes: "guias" })} className="hover:text-white">Guías y refugios</button></li>
              <li><button onClick={() => setLead({ interes: "colaborar" })} className="hover:text-white">Colaborar</button></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-white mb-3">Contacto</p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> info@cumbrecert.com</li>
              <li>
                <a href="mailto:info@cumbrecert.com?subject=Sugerencias%20y%20comentarios" className="flex items-center gap-2 hover:text-white">
                  <MessageSquare className="w-4 h-4" /> Sugerencias y comentarios
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 py-5 text-center text-xs">© {new Date().getFullYear()} CumbreCert. Todos los derechos reservados.</div>
      </footer>

      {lead && <LeadDialog open={!!lead} onOpenChange={(o) => !o && setLead(null)} interes={lead.interes} contexto={lead.contexto} />}
    </div>
  );
}
