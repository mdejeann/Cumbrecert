# CumbreCert — Brainstorm de Diseño

## Contexto del Proyecto
CumbreCert es la primera plataforma argentina de certificación digital para senderistas. El sitio debe comunicar autoridad institucional, accesibilidad, y comunidad. La audiencia incluye senderistas casuales, trekkers avanzados, turistas extranjeros, y guías de montaña.

---

## Idea 1: Modernismo Alpino — Minimalista + Geométrico
**Probabilidad: 0.07**

**Design Movement:** Modernismo Suizo aplicado a la montaña. Inspiración en cartografía topográfica, señalización de senderos, y diseño de refugios alpinos contemporáneos.

**Core Principles:**
- Geometría clara y funcional (triángulos, líneas diagonales, formas angulares)
- Tipografía sin-serif audaz con jerarquía muy definida
- Espacios en blanco generosos que respiran
- Paleta reducida con acentos de color estratégicos

**Color Philosophy:**
- Verde montaña oscuro (#1B5E20) como primario — autoridad, naturaleza, confianza
- Blanco puro y grises neutros — claridad, modernidad
- Verde lima (#8BC34A) como acento — energía, movimiento, juventud
- Fondos sutilmente texturizados (no planos)

**Layout Paradigm:**
- Secciones con cortes diagonales y ángulos (clip-path)
- Asimetría intencional: texto a la izquierda, imagen a la derecha (o viceversa)
- Grillas de 3 columnas en desktop, stack vertical en mobile
- Uso de líneas divisoras angulares en lugar de separadores rectos

**Signature Elements:**
1. Pico de montaña estilizado (triángulo) como decoración recurrente
2. Líneas diagonales que conectan secciones
3. Badges con formas geométricas (hexágonos, triángulos)

**Interaction Philosophy:**
- Hover states con cambio de color sutil + escala leve
- Botones con bordes geométricos (no redondeados)
- Transiciones suaves de 300ms en todos los elementos

**Animation:**
- Fade-in staggered en hero (200ms entre elementos)
- Cards que se deslizan desde abajo al scroll (slide-up)
- Números que cuentan hacia arriba (count-up) en stats
- Líneas diagonales que se animan al cargar

**Typography System:**
- Display: Playfair Display 700 (serif elegante) — 48-72px
- Subtítulos: DM Sans 600 — 24-32px
- Body: DM Sans 400 — 16-18px
- Labels: DM Sans 500 — 12-14px
- CTA: DM Sans 700 uppercase — 16px

---

## Idea 2: Aventura Orgánica — Naturalista + Ilustrativo
**Probabilidad: 0.08**

**Design Movement:** Diseño de aventura outdoor inspirado en marcas como Patagonia, REI, y guías de montaña clásicas. Énfasis en lo natural, lo auténtico, lo vivido.

**Core Principles:**
- Fotografía de montaña auténtica argentina como protagonista
- Ilustraciones hand-drawn de senderistas, animales, plantas
- Tipografía cálida con mezcla de serif y sans-serif
- Texturas naturales (papel, madera, tela)

**Color Philosophy:**
- Verde montaña como base, pero con variaciones cálidas (terracota, ocre, marrón)
- Acentos en naranja/rojo (atardecer en la cordillera)
- Fondos con textura de papel o lino
- Paleta inspirada en amaneceres patagónicos

**Layout Paradigm:**
- Secciones con imágenes grandes y envolventes
- Texto superpuesto sobre fotografía con overlay oscuro
- Carrusel de testimonios con fotos circulares grandes
- Flujo narrativo: cada sección cuenta una historia

**Signature Elements:**
1. Ilustración de senderista en cumbre (recurrente)
2. Líneas de contorno de montañas como decoración
3. Badges con estilo vintage/retro

**Interaction Philosophy:**
- Hover states con revelación de información
- Botones con efecto de "presión" (press-down animation)
- Transiciones suaves que revelan contenido

**Animation:**
- Parallax en imágenes de fondo
- Fade-in suave en texto
- Ilustraciones que se animan al scroll
- Carrusel automático suave

**Typography System:**
- Display: Playfair Display 700 — 48-72px (serif cálido)
- Subtítulos: Merriweather 600 — 24-32px (serif legible)
- Body: DM Sans 400 — 16-18px (sans-serif moderno)
- Labels: DM Sans 500 — 12-14px
- CTA: DM Sans 700 uppercase — 16px

---

## Idea 3: Tecnología Certificada — Futurista + Confianza
**Probabilidad: 0.06**

**Design Movement:** Diseño de SaaS moderno con énfasis en verificación, seguridad, y tecnología. Inspiración en plataformas de certificación digital, blockchain, y fintech.

**Core Principles:**
- Interfaz limpia y profesional (como un dashboard)
- Uso de iconografía moderna y consistente
- Énfasis en el QR como elemento central
- Paleta técnica con toques de verde montaña

**Color Philosophy:**
- Verde montaña (#1B5E20) como primario
- Azul técnico como secundario (confianza digital)
- Gris neutro para fondos
- Acentos en verde lima para confirmaciones

**Layout Paradigm:**
- Secciones con cards modulares
- Grillas simétricas y predecibles
- Mockups de app/QR como elementos visuales
- Timeline visual de pasos

**Signature Elements:**
1. Icono de QR verificable
2. Checkmarks animados
3. Badges de certificación

**Interaction Philosophy:**
- Micro-interacciones precisas (confirmaciones, validaciones)
- Botones con feedback inmediato
- Transiciones rápidas (150ms)

**Animation:**
- Check animado al completar acciones
- Scan de QR simulado
- Números contando hacia arriba
- Pulse en elementos interactivos

**Typography System:**
- Display: DM Sans 700 — 48-72px (sans-serif moderno)
- Subtítulos: DM Sans 600 — 24-32px
- Body: DM Sans 400 — 16-18px
- Labels: DM Sans 500 — 12-14px
- CTA: DM Sans 700 uppercase — 16px

---

## Decisión Final: **IDEA 1 — Modernismo Alpino**

He elegido el **Modernismo Alpino** porque:
1. **Diferenciación:** Evita el cliché de "aventura outdoor" que es saturado en el mercado
2. **Autoridad:** La geometría clara y la tipografía audaz comunican profesionalismo y confianza institucional
3. **Funcionalidad:** Los cortes diagonales y la asimetría son visualmente memorables sin ser caóticos
4. **Escalabilidad:** El sistema es fácil de mantener y extender a futuras fases (app, niveles 2-3)
5. **Accesibilidad:** Contraste claro, espacios en blanco generosos, tipografía legible

**Elementos clave a mantener:**
- Verde montaña oscuro (#1B5E20) como color primario
- Playfair Display para headlines (serif elegante)
- DM Sans para body y UI (sans-serif moderno)
- Cortes diagonales en secciones
- Líneas geométricas como decoración
- Espacios en blanco generosos
- Animaciones suaves y funcionales
