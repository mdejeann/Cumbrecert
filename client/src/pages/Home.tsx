import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ChevronDown, Menu, X, Check, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";

/**
 * CumbreCert Home Page — One-pager landing site
 * Design: Modernismo Alpino — Minimalist + Geometric
 * Color Palette: Mountain Green (#1B5E20), Lime Green (#8BC34A), Clean Whites
 * Typography: Playfair Display (headlines) + DM Sans (body)
 */

export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 3000);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white text-[#2D2D2D]">
      {/* ============ STICKY NAVIGATION ============ */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white shadow-md"
            : "bg-transparent"
        }`}
      >
        <div className="container flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#1B5E20] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">▲</span>
            </div>
            <span className="font-bold text-lg text-[#1B5E20] hidden sm:inline">
              CumbreCert
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("como-funciona")}
              className="text-sm font-medium hover:text-[#1B5E20] transition"
            >
              Cómo funciona
            </button>
            <button
              onClick={() => scrollToSection("niveles")}
              className="text-sm font-medium hover:text-[#1B5E20] transition"
            >
              Niveles
            </button>
            <button
              onClick={() => scrollToSection("testimonios")}
              className="text-sm font-medium hover:text-[#1B5E20] transition"
            >
              Comunidad
            </button>
            <button
              onClick={() => scrollToSection("faq")}
              className="text-sm font-medium hover:text-[#1B5E20] transition"
            >
              Preguntas
            </button>
          </div>

          {/* CTA Buttons */}
          <div className="hidden sm:flex items-center gap-2">
            {user ? (
              <Link href="/dashboard">
                <button className="btn-cta">Mi dashboard</button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <button className="text-sm font-medium text-[#1B5E20] hover:underline px-3 py-2">Iniciar sesión</button>
                </Link>
                <Link href="/register">
                  <button className="btn-cta">Comenzá gratis</button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#1B5E20] text-white p-4 space-y-4">
            <button
              onClick={() => scrollToSection("como-funciona")}
              className="block w-full text-left py-2 hover:text-[#8BC34A]"
            >
              Cómo funciona
            </button>
            <button
              onClick={() => scrollToSection("niveles")}
              className="block w-full text-left py-2 hover:text-[#8BC34A]"
            >
              Niveles
            </button>
            <button
              onClick={() => scrollToSection("testimonios")}
              className="block w-full text-left py-2 hover:text-[#8BC34A]"
            >
              Comunidad
            </button>
            <button
              onClick={() => scrollToSection("faq")}
              className="block w-full text-left py-2 hover:text-[#8BC34A]"
            >
              Preguntas
            </button>
            <button className="btn-cta-secondary w-full mt-4">
              Comenzá gratis
            </button>
          </div>
        )}
      </nav>

      {/* ============ HERO SECTION ============ */}
      <section
        className="relative h-screen flex items-center justify-center overflow-hidden pt-20"
        style={{
          backgroundImage:
            "url('https://d2xsxph8kpxj0f.cloudfront.net/310519663469351135/mDv3jUPJokU654taR8cMEm/hero-mountain-sunrise-WE4bkKxENCbSciy5hmXNaZ.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />

        <div className="relative z-10 container text-center text-white max-w-3xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0 }}
            className="text-5xl md:text-7xl font-bold mb-4 leading-tight"
          >
            Certificá tu conocimiento de montaña.
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl font-light mb-8 leading-relaxed"
          >
            Subí libre, subí seguro.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg md:text-xl mb-8 max-w-2xl mx-auto"
          >
            El primer certificado digital argentino para senderistas. Respaldado por el CCAM y guías de montaña certificados. Estudiá online, evaluá, obtené tu QR y accedé a más destinos.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href={user ? "/dashboard" : "/register"}>
              <button className="btn-cta bg-white text-[#1B5E20] hover:bg-[#F1F8E9]">
                {user ? "Ir a mi dashboard" : "Comenzá tu certificación gratis"}
              </button>
            </Link>
            <button onClick={() => scrollToSection("niveles")} className="text-white hover:text-[#8BC34A] transition flex items-center gap-2">
              ¿Ya tenés experiencia? Ver todos los niveles →
            </button>
          </motion.div>

          {/* Social proof badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-12 inline-block bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full text-sm"
          >
            🏔️ +1.200 senderistas ya certificados
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
        >
          <ChevronDown className="w-8 h-8 text-white" />
        </motion.div>
      </section>

      {/* ============ INSTITUTIONAL LOGOS BAR ============ */}
      <section className="bg-[#F1F8E9] py-8 border-b border-[#C8E6C9]">
        <div className="container">
          <p className="text-center text-sm font-semibold text-[#1B5E20] mb-6">
            CON EL RESPALDO DE
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            <img
              src="/ccam-logo.png"
              alt="CCAM"
              className="h-12 opacity-80 hover:opacity-100 transition"
            />
            <div className="h-12 flex items-center text-sm font-bold text-[#1B5E20]">
              AAGM
            </div>
            <div className="h-12 flex items-center text-sm font-bold text-[#1B5E20]">
              ISAGM
            </div>
            <div className="h-12 flex items-center text-sm font-bold text-[#1B5E20]">
              Refugio Frey
            </div>
          </div>
        </div>
      </section>

      {/* ============ THE PROBLEM SECTION ============ */}
      <section className="bg-white py-16 md:py-24">
        <div className="container max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-[#1B5E20]">
            La montaña argentina no tiene reglas claras.
          </h2>
          <p className="text-center text-lg text-[#666] mb-12">
            Hasta ahora.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "🚫",
                title: "Te piden guía obligatorio",
                desc: "En muchos parques y cerros, si no vas con guía, no podés subir. Sin importar cuántas veces hayas salido al campo.",
              },
              {
                icon: "📋",
                title: "Cada lugar pide algo distinto",
                desc: "Un papel acá, un permiso allá, un formulario en otro lado. No hay un estándar.",
              },
              {
                icon: "🌍",
                title: "Los turistas extranjeros no saben cómo acreditarse",
                desc: "Vienen con experiencia en los Alpes o los Andes chilenos, pero acá no hay nada que reconozca ese conocimiento.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-[#F1F8E9] p-8 rounded-lg border border-[#C8E6C9]"
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-[#1B5E20] mb-3">
                  {item.title}
                </h3>
                <p className="text-[#666]">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-lg font-semibold mt-12 text-[#1B5E20]">
            CumbreCert es el estándar que la comunidad de montaña argentina necesitaba: un certificado que habla por vos cuando llegás a la barrera.
          </p>

          <div className="text-center mt-8">
            <Link href={user ? "/dashboard" : "/register"}>
              <button className="btn-cta">Comenzá tu certificación gratis</button>
            </Link>
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section
        id="como-funciona"
        className="bg-[#1A1A1A] text-white py-16 md:py-24"
      >
        <div className="container max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Tres pasos. Sin burocracia.
          </h2>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {[
              {
                num: "01",
                title: "Estudiá online",
                desc: "Accedé a los módulos de formación desde tu celular o computadora. Videos cortos, fichas técnicas y simulacros de situaciones reales en la montaña. Gratis para el Nivel Inicial.",
              },
              {
                num: "02",
                title: "Aprobá la evaluación",
                desc: "Completá el examen online de conocimiento. Sin tiempo límite, sin trampa: si aprendiste, aprobás. El sistema guarda tu progreso.",
              },
              {
                num: "03",
                title: "Mostrá tu QR",
                desc: "Recibís tu certificado digital con QR único verificable. Lo mostrás en el ingreso al parque, lo compartís con el guía, lo llevás en el celular. Sin papel, sin trámites.",
              },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-6xl font-bold text-[#8BC34A] mb-4">
                  {step.num}
                </div>
                <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-300">{step.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href={user ? "/dashboard" : "/register"}>
              <button className="btn-cta-secondary">
                Comenzá tu certificación gratis
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ============ CERTIFICATION LEVELS ============ */}
      <section
        id="niveles"
        className="bg-white py-16 md:py-24"
      >
        <div className="container max-w-5xl">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-[#1B5E20]">
            Tu camino en la montaña, nivel por nivel.
          </h2>

          <div className="mt-12 mb-8">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663469351135/mDv3jUPJokU654taR8cMEm/certification-levels-illustration-QZyzUp2VZRVqMHChbyDxd4.webp"
              alt="Certification Levels"
              className="w-full h-auto"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                level: "NIVEL 0",
                name: "Explorador Iniciante",
                price: "GRATIS",
                badge: "free",
                modules: ["Qué llevar", "Calzado", "Hidratación", "Señalización básica", "Clima"],
                for: "Primera vez en la montaña, o quienes quieren validar sus conocimientos básicos.",
                cta: "Empezar ahora — gratis",
              },
              {
                level: "NIVEL 1",
                name: "Senderista Certificado",
                price: "USD 20",
                badge: "price",
                modules: ["Orientación", "Primeros auxilios", "Leave No Trace", "Ecosistemas"],
                for: "Senderistas con experiencia que quieren el certificado QR reconocido.",
                cta: "Ver contenidos",
              },
              {
                level: "NIVEL 2",
                name: "Trekker Avanzado",
                price: "USD 50",
                badge: "coming",
                modules: ["Navegación GPS", "Condiciones extremas", "Bivouac", "Rescate básico"],
                for: "Trekkers que hacen travesías de varios días en zonas remotas.",
                cta: "Anotarme en lista de espera",
              },
              {
                level: "NIVEL 3",
                name: "Montaña Responsable",
                price: "USD 100",
                badge: "coming",
                modules: ["Liderazgo", "Alta montaña", "Glaciares", "Gestión de grupos"],
                for: "Quien quiere liderar grupos o prepararse para guía profesional.",
                cta: "Anotarme en lista de espera",
              },
            ].map((level, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="border-2 border-[#C8E6C9] rounded-lg p-6 hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-bold text-[#1B5E20]">{level.level}</p>
                    <h3 className="text-2xl font-bold text-[#1B5E20]">
                      {level.name}
                    </h3>
                  </div>
                  {level.badge === "free" && (
                    <span className="badge-free">GRATIS</span>
                  )}
                  {level.badge === "coming" && (
                    <span className="badge-coming">Próximamente</span>
                  )}
                </div>

                {level.badge === "price" && (
                  <p className="text-lg font-bold text-[#1B5E20] mb-4">
                    {level.price}
                  </p>
                )}

                <p className="text-sm text-[#666] mb-4">{level.for}</p>

                <div className="space-y-2 mb-6">
                  {level.modules.map((mod, j) => (
                    <div key={j} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-[#8BC34A] rounded-full" />
                      {mod}
                    </div>
                  ))}
                </div>

                <Link href={level.badge === "free" ? (user ? "/dashboard" : "/register") : "#"}>
                  <button className="btn-cta w-full text-center">
                    {level.cta}
                  </button>
                </Link>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-sm text-[#666] mt-8">
            Los niveles 2 y 3 están en desarrollo. Anotate en la lista de espera y recibís acceso anticipado con descuento.
          </p>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section
        id="testimonios"
        className="py-16 md:py-24"
        style={{
          backgroundImage:
            "url('https://d2xsxph8kpxj0f.cloudfront.net/310519663469351135/mDv3jUPJokU654taR8cMEm/community-testimonials-bg-kgtuYqj8gyy8cWHPJTpfmL.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="container max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-[#1B5E20]">
            Lo que dice la comunidad de montaña
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote:
                  "Siempre me parecía injusto tener que pagar un guía en una ruta que conozco de memoria. Con CumbreCert pude demostrar que sé lo que hago y subir solo. Es exactamente lo que faltaba.",
                author: "Martín R.",
                location: "Senderista — Bariloche",
              },
              {
                quote:
                  "Vengo de Alemania a hacer el circuito del Aconcagua hace tres años seguidos. El año pasado tuve que llevar guía porque no tenía nada que me acreditara. Este año usé mi certificado CumbreCert y fue otra experiencia.",
                author: "Anna S.",
                location: "Trekker — München / Mendoza",
              },
              {
                quote:
                  "Como guía, lo mejor es que ahora los grupos que me contratan vienen con conocimiento base. No pierdo tiempo explicando qué calzado poner. Recomiendo CumbreCert a todos mis clientes antes de salir.",
                author: "Gustavo L.",
                location: "Guía Certificado — El Chaltén",
              },
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white rounded-lg p-6 shadow-md"
              >
                <p className="text-[#666] mb-4 italic">
                  "{testimonial.quote}"
                </p>
                <p className="font-bold text-[#1B5E20]">{testimonial.author}</p>
                <p className="text-sm text-[#999]">{testimonial.location}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TRUST BLOCK ============ */}
      <section className="bg-[#1B5E20] text-white py-16 md:py-24">
        <div className="container max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            Un certificado respaldado por quienes más saben de montaña en Argentina.
          </h2>

          <p className="text-lg mb-8 leading-relaxed">
            CumbreCert nació de un acuerdo con el Centro Cultural Argentino de Montaña (CCAM) y la Asociación Argentina de Guías de Montaña (AAGM).
          </p>

          <p className="text-lg mb-12 leading-relaxed">
            Cada certificado lleva la firma digital de estas instituciones y un QR único verificable en tiempo real. Cuando lo mostrás en el ingreso a un parque o refugio, no hay lugar para la duda.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              {
                icon: "🔐",
                title: "Certificado con QR único",
                desc: "Verificable online por guardaparques y guías en menos de 5 segundos",
              },
              {
                icon: "🏔️",
                title: "Avalado por el CCAM",
                desc: "22 años de trabajo en cultura y educación de montaña argentina",
              },
              {
                icon: "📲",
                title: "Funciona offline",
                desc: "El QR puede mostrarse sin conexión a internet desde la app",
              },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-200">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href={user ? "/dashboard" : "/register"}>
              <button className="btn-cta-secondary">
                Comenzá tu certificación gratis
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ============ LEAD CAPTURE FORM ============ */}
      <section className="bg-[#F1F8E9] py-16 md:py-24">
        <div className="container max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-2 text-[#1B5E20]">
            Recibí novedades, guías gratuitas y acceso anticipado a nuevos niveles.
          </h2>
          <p className="text-center text-[#666] mb-8">
            Somos comunidad. No spam.
          </p>

          {!formSubmitted ? (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Tu nombre"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-[#C8E6C9] focus:outline-none focus:ring-2 focus:ring-[#1B5E20]"
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="hola@email.com"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-[#C8E6C9] focus:outline-none focus:ring-2 focus:ring-[#1B5E20]"
                />
              </div>
              <div>
                <select className="w-full px-4 py-3 rounded-lg border border-[#C8E6C9] focus:outline-none focus:ring-2 focus:ring-[#1B5E20]">
                  <option value="">¿Dónde solés salir a la montaña?</option>
                  <option value="patagonia">Patagonia (Bariloche, El Chaltén, El Calafate)</option>
                  <option value="cuyo">Cuyo (Mendoza, San Juan, San Luis)</option>
                  <option value="noa">NOA (Salta, Jujuy, Tucumán, Catamarca)</option>
                  <option value="pampeana">Pampeana (Sierra de la Ventana, Tandilia)</option>
                  <option value="cordoba">Córdoba</option>
                  <option value="litoral">Litoral / Mesopotamia</option>
                  <option value="otro">Otro / Extranjero</option>
                </select>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-[#1B5E20]">¿Cuál es tu nivel de experiencia?</p>
                <div className="flex gap-4">
                  {["Iniciante", "Intermedio", "Avanzado"].map((level) => (
                    <label key={level} className="flex items-center gap-2">
                      <input type="radio" name="level" value={level} />
                      <span className="text-sm">{level}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button type="submit" className="btn-cta w-full">
                Quiero recibir novedades
              </button>
              <p className="text-center text-xs text-[#999]">
                No compartimos tus datos con terceros. Podés darte de baja cuando quieras.
              </p>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <Check className="w-12 h-12 text-[#8BC34A] mx-auto mb-4" />
              <p className="text-lg font-bold text-[#1B5E20]">
                ¡Listo! Te sumaste a la comunidad CumbreCert. 🏔️
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section id="faq" className="bg-white py-16 md:py-24">
        <div className="container max-w-3xl">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-[#1B5E20]">
            Preguntas frecuentes
          </h2>

          <div className="space-y-4">
            {[
              {
                q: "¿Es gratuito?",
                a: "El Nivel Inicial (Explorador Iniciante) es completamente gratuito: podés estudiar todos los módulos, hacer la evaluación y recibir tu certificado QR sin pagar nada. Los niveles superiores tienen un costo que varía entre USD 20 y USD 100.",
              },
              {
                q: "¿Es oficial? ¿Los parques lo aceptan?",
                a: "CumbreCert está avalado por el CCAM y la AAGM, las instituciones de montaña más importantes del país. Estamos en proceso de acuerdo con administraciones de parques provinciales y nacionales. Cada nuevo acuerdo se comunica en nuestra web y redes.",
              },
              {
                q: "¿Cuánto tiempo lleva completar el Nivel Inicial?",
                a: "El Nivel Inicial tiene aproximadamente 2 horas de contenido. Podés hacerlo en una tarde o dividirlo en varios días. El sistema guarda tu progreso.",
              },
              {
                q: "¿El certificado vence?",
                a: "Sí. El certificado del Nivel Inicial tiene vigencia de 2 años. Renovarlo es gratuito si aprobás una evaluación de actualización. Esto garantiza que el conocimiento sea real y no solo un papel viejo.",
              },
              {
                q: "¿Puedo hacerlo desde el celular?",
                a: "Sí. El sitio está optimizado para mobile y existe una app descargable (Android e iOS) donde también podés guardar tu certificado para mostrarlo offline, sin necesidad de conexión.",
              },
              {
                q: "¿Puedo inscribir a mis hijos?",
                a: "Sí. Hay versiones de los módulos adaptadas para jóvenes desde los 12 años. Menores de 18 necesitan autorización del adulto responsable al momento del registro.",
              },
              {
                q: "Soy guía de montaña. ¿Cómo puedo aparecer en la plataforma?",
                a: "Tenemos un perfil especial para guías certificados AAGM/ISAGM. Podés publicar tus servicios, recibir reservas y ofrecer los cursos de niveles 2 y 3. Escribinos a info@cumbrecert.com o completá el formulario de 'Quiero ser guía instructor'.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="border border-[#C8E6C9] rounded-lg overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpandedFaq(expandedFaq === i ? null : i)
                  }
                  className="w-full p-4 flex items-center justify-between hover:bg-[#F1F8E9] transition"
                >
                  <span className="font-bold text-[#1B5E20] text-left">
                    {item.q}
                  </span>
                  <span
                    className={`transition transform ${
                      expandedFaq === i ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                </button>
                {expandedFaq === i && (
                  <div className="p-4 bg-[#F1F8E9] border-t border-[#C8E6C9]">
                    <p className="text-[#666]">{item.a}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="bg-[#1A1A1A] text-white py-12">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Column 1 - Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#8BC34A] rounded-full flex items-center justify-center">
                  <span className="text-[#1A1A1A] font-bold">▲</span>
                </div>
                <span className="font-bold text-lg">CumbreCert</span>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Del senderista curioso al alpinista responsable.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-[#8BC34A]">
                  Instagram
                </a>
                <a href="#" className="text-gray-400 hover:text-[#8BC34A]">
                  TikTok
                </a>
                <a href="#" className="text-gray-400 hover:text-[#8BC34A]">
                  YouTube
                </a>
              </div>
            </div>

            {/* Column 2 - Links */}
            <div>
              <h4 className="font-bold mb-4">Enlaces</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#como-funciona" className="hover:text-[#8BC34A]">
                    Cómo funciona
                  </a>
                </li>
                <li>
                  <a href="#niveles" className="hover:text-[#8BC34A]">
                    Niveles de certificación
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#8BC34A]">
                    Para guías instructores
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#8BC34A]">
                    Prensa y contacto
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3 - Trust */}
            <div>
              <h4 className="font-bold mb-4">Respaldo</h4>
              <p className="text-sm text-gray-400">
                Certificación avalada por instituciones de montaña argentinas
              </p>
              <div className="mt-4 flex gap-4">
                <img
                  src="https://d2xsxph8kpxj0f.cloudfront.net/310519663469351135/mDv3jUPJokU654taR8cMEm/ccam-logo-png-Gg5sFfXMjmDzHGPLuYPAGE.webp"
                  alt="CCAM"
                  className="h-8 opacity-60"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8">
            <Link href={user ? "/dashboard" : "/register"}>
              <button className="btn-cta w-full md:w-auto mb-8">
                Comenzá tu certificación gratis
              </button>
            </Link>
            <p className="text-xs text-gray-500">
              © 2026 CumbreCert. Todos los derechos reservados. ·{" "}
              <a href="#" className="hover:text-gray-400">
                Términos y condiciones
              </a>{" "}
              ·{" "}
              <a href="#" className="hover:text-gray-400">
                Política de privacidad
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
