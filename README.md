# CumbreCert — Plataforma de Certificación Digital para Senderistas

**CumbreCert** es la primera plataforma argentina de certificación digital para senderistas y trekkers. Replica el modelo de certificación del buceo (PADI/SSI) aplicado al mundo de la montaña.

## 🎯 Descripción

CumbreCert cumple tres funciones simultáneas:
1. **Convertir visitantes en leads** — Captura de email y datos de interés
2. **Convertir leads en alumnos** — Venta de cursos o inicio de curso gratuito
3. **Construir legitimidad institucional** — Demostrar el respaldo del CCAM, AAGM y guías certificados

## ✨ Características

- ✅ **One-pager responsive** — Todas las secciones en una sola página con scroll fluido
- ✅ **Navegación sticky** — Barra de navegación fija con CTA repetido
- ✅ **Hero épico** — Imagen de montaña argentina con overlay oscuro
- ✅ **4 niveles de certificación** — Desde Explorador Iniciante (gratuito) hasta Montaña Responsable (USD 100)
- ✅ **Testimonios reales** — Social proof de la comunidad de montaña
- ✅ **Formulario de leads** — Captura de email con segmentación por región
- ✅ **FAQ interactivo** — 7 preguntas frecuentes con acordeón
- ✅ **Bloque de confianza** — QR verificable, respaldo CCAM/AAGM
- ✅ **Animaciones suaves** — Fade-in, slide-up, count-up con Framer Motion
- ✅ **Mobile-first** — Totalmente optimizado para dispositivos móviles

## 🎨 Diseño

**Modernismo Alpino** — Estética minimalista y geométrica inspirada en cartografía topográfica y diseño suizo contemporáneo.

### Paleta de Colores

| Color | Hex | Uso |
|-------|-----|-----|
| Verde Montaña Oscuro | `#1B5E20` | CTA, headings, nav activa |
| Verde Montaña Medio | `#2E7D32` | Hover states, badges |
| Verde Lima | `#8BC34A` | Highlights, checkmarks, "GRATIS" |
| Verde Superficie | `#F1F8E9` | Fondos de secciones alternas |
| Texto Principal | `#2D2D2D` | Body text, párrafos |
| Fondo Oscuro | `#1A1A1A` | Footer, overlay hero |

### Tipografía

- **Headlines:** Playfair Display 700 (serif elegante)
- **Body:** DM Sans 400 (sans-serif moderno)
- **Labels:** DM Sans 500

## 🚀 Inicio Rápido

### Requisitos

- Node.js 18+
- pnpm 10+

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/mdejeann/Cumbrecert.git
cd Cumbrecert

# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo
pnpm dev
```

Abre `http://localhost:5173` en tu navegador.

## 📁 Estructura del Proyecto

```
cumbrecert/
├── client/
│   ├── public/
│   │   └── ccam-logo.png          # Logo del CCAM
│   ├── src/
│   │   ├── pages/
│   │   │   └── Home.tsx           # Página principal (one-pager)
│   │   ├── components/
│   │   │   └── ui/                # Componentes shadcn/ui
│   │   ├── App.tsx                # Rutas principales
│   │   └── index.css              # Estilos globales + design tokens
│   └── index.html                 # HTML principal
├── server/                        # Servidor Express (placeholder)
├── shared/                        # Constantes compartidas
├── package.json                   # Dependencias
└── README_LOCAL.md                # Guía de desarrollo local
```

## 📊 Secciones del Sitio

```
[01] NAV FIJA — Sticky navigation con logo, links y CTA
[02] HERO — Pantalla completa con imagen de montaña
[03] BARRA DE LOGOS — Social proof institucional (CCAM, AAGM, ISAGM)
[04] EL PROBLEMA — 3 pain points de la montaña argentina
[05] CÓMO FUNCIONA — 3 pasos del proceso
[06] NIVELES DE CERTIFICACIÓN — 4 cards con precios y badges
[07] TESTIMONIOS — 3 voces reales de la comunidad
[08] BLOQUE DE CONFIANZA — QR, CCAM, funcionalidad offline
[09] FORMULARIO DE CAPTURA DE LEADS — Email + segmentación
[10] FAQ — 7 preguntas frecuentes con acordeón
[11] FOOTER — Links, redes sociales, respaldo institucional
```

## 🔧 Scripts Disponibles

```bash
pnpm dev          # Servidor de desarrollo con HMR
pnpm build        # Build para producción
pnpm preview      # Vista previa del build
pnpm check        # Verificar tipos TypeScript
pnpm format       # Formatear código con Prettier
```

## 🌐 Deploy

### Vercel (Recomendado)

```bash
npm i -g vercel
vercel
```

### Netlify

```bash
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

## 📖 Documentación

Para más detalles sobre personalización, estructura y desarrollo, consulta `README_LOCAL.md`.

## 🚀 Próximos Pasos

1. **Integración de Backend** — Conectar formulario de leads a Brevo/Mailchimp
2. **Plataforma de Cursos** — Módulos de video, evaluaciones, certificados PDF con QR
3. **App Móvil** — PWA o React Native con Expo
4. **Marketplace de Guías** — Directorio de guías certificados AAGM
5. **Sistema de Verificación QR** — Backend para verificar certificados en tiempo real

## 📞 Contacto

- **Email:** info@cumbrecert.com
- **Instagram:** @cumbrecert
- **TikTok:** @cumbrecert

## 📄 Licencia

© 2026 CumbreCert. Todos los derechos reservados.

---

**Versión:** 1.0.0  
**Estado:** ✅ MVP Funcional  
**Última actualización:** Marzo 2026
