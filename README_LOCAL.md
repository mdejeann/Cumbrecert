# CumbreCert — Plataforma de Certificación Digital para Senderistas

Bienvenido a **CumbreCert**, la primera plataforma argentina de certificación digital para senderistas y trekkers. Este proyecto es un sitio web one-pager responsive que replica el modelo de certificación del buceo (PADI/SSI) aplicado al mundo de la montaña.

## 📋 Descripción del Proyecto

CumbreCert cumple tres funciones simultáneas:

1. **Convertir visitantes en leads** — Captura de email y datos de interés
2. **Convertir leads en alumnos** — Venta de cursos o inicio de curso gratuito
3. **Construir legitimidad institucional** — Demostrar el respaldo del CCAM, AAGM y guías certificados

### Características Principales

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

## 🎨 Diseño — Modernismo Alpino

El sitio implementa una estética **minimalista y geométrica** inspirada en cartografía topográfica y diseño suizo contemporáneo.

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

- **Headlines (H1-H3):** Playfair Display 700 (serif elegante) — 48-72px
- **Subtítulos (H2-H3):** DM Sans 600 — 24-32px
- **Body/Párrafos:** DM Sans 400 — 16-18px
- **Labels/Badges:** DM Sans 500 — 12-14px
- **CTA Button:** DM Sans 700 uppercase — 16px

## 🏗️ Arquitectura del Sitio

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

## 🚀 Configuración Local

### Requisitos Previos

- **Node.js** 22+ via [nvm](https://github.com/nvm-sh/nvm)
- **pnpm** 10+
- **Docker** (para la base de datos MySQL)

### Primera vez — instalación completa

#### 1. Instalar nvm + Node.js

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc   # o ~/.zshrc si usás zsh
nvm install 22
nvm use 22
nvm alias default 22
```

#### 2. Instalar pnpm

```bash
npm install -g pnpm
```

#### 3. Instalar dependencias

```bash
pnpm install
pnpm approve-builds   # aprueba compilación de binarios nativos (esbuild, tailwind)
```

#### 4. Instalar Docker y crear la base de datos MySQL

```bash
sudo apt install -y docker.io
sudo usermod -aG docker $USER
newgrp docker
```

Iniciar el contenedor MySQL:

```bash
docker run --name cumbrecert-mysql \
  -e MYSQL_ROOT_PASSWORD=cumbrecert \
  -e MYSQL_DATABASE=cumbrecert \
  -e MYSQL_USER=cumbrecert \
  -e MYSQL_PASSWORD=cumbrecert \
  -p 3306:3306 -d mysql:8.0
```

#### 5. Crear el archivo `.env`

Crear el archivo `/home/matias/Documents/GitHub/Cumbrecert/.env` con:

```env
DATABASE_URL=mysql://cumbrecert:cumbrecert@localhost:3306/cumbrecert
JWT_SECRET=cumbrecert_local_secret_key_2026
NODE_ENV=development
OAUTH_SERVER_URL=
OWNER_OPEN_ID=
VITE_APP_ID=cumbrecert
```

#### 6. Correr migraciones

```bash
export NVM_DIR="$HOME/.nvm" && \. "$NVM_DIR/nvm.sh"
pnpm db:push
```

> Si falla, las migraciones se pueden aplicar directamente con:
> ```bash
> newgrp docker
> docker exec -i cumbrecert-mysql mysql -ucumbrecert -pcumbrecert cumbrecert < drizzle/0000_cold_lionheart.sql
> # ... repetir para cada archivo .sql en drizzle/
> ```

---

### Iniciar el proyecto (uso diario)

#### 1. Asegurarse de que el contenedor MySQL esté corriendo

```bash
newgrp docker && docker start cumbrecert-mysql
```

#### 2. Iniciar el servidor de desarrollo

```bash
export NVM_DIR="$HOME/.nvm" && \. "$NVM_DIR/nvm.sh"
pnpm dev
```

El servidor corre en **http://localhost:3000** (o el siguiente puerto disponible).

---

### Primer usuario admin

Después de registrarte, otorgá el rol admin desde la base de datos:

```bash
newgrp docker && docker exec cumbrecert-mysql \
  mysql -ucumbrecert -pcumbrecert cumbrecert \
  -e "UPDATE users SET role='admin' WHERE email='tu@email.com';"
```

Luego accedé a **http://localhost:3000/admin/cursos** y hacé clic en **"Cargar Contenido Nivel 0"** para cargar el curso de prueba.

---

### Scripts Disponibles

```bash
# Desarrollo
pnpm dev          # Inicia el servidor de desarrollo (Express + Vite HMR)

# Base de datos
pnpm db:push      # Genera y aplica migraciones

# Build
pnpm build        # Compila el proyecto para producción
pnpm preview      # Vista previa del build de producción

# Calidad de código
pnpm check        # Verifica tipos TypeScript
pnpm format       # Formatea código con Prettier
```

## 📁 Estructura del Proyecto

```
cumbrecert/
├── client/
│   ├── public/
│   │   ├── ccam-logo.png          # Logo del CCAM
│   │   └── __manus__/             # Archivos de Manus
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx           # Página principal (one-pager)
│   │   │   └── NotFound.tsx       # Página 404
│   │   ├── components/
│   │   │   └── ui/                # Componentes shadcn/ui
│   │   ├── contexts/
│   │   │   └── ThemeContext.tsx   # Contexto de tema
│   │   ├── App.tsx                # Rutas principales
│   │   ├── main.tsx               # Punto de entrada React
│   │   └── index.css              # Estilos globales + design tokens
│   ├── index.html                 # HTML principal
│   └── vite.config.ts             # Configuración de Vite
├── server/
│   └── index.ts                   # Servidor Express (placeholder)
├── shared/
│   └── const.ts                   # Constantes compartidas
├── package.json                   # Dependencias y scripts
├── tsconfig.json                  # Configuración TypeScript
├── tailwind.config.ts             # Configuración Tailwind CSS
└── README_LOCAL.md                # Este archivo
```

## 🎯 Secciones Clave del Código

### Home.tsx — Página Principal

La página principal (`client/src/pages/Home.tsx`) contiene todas las secciones del sitio. Está organizada en bloques claramente comentados:

```tsx
// [01] STICKY NAVIGATION
// [02] HERO SECTION
// [03] INSTITUTIONAL LOGOS BAR
// [04] THE PROBLEM SECTION
// [05] HOW IT WORKS
// [06] CERTIFICATION LEVELS
// [07] TESTIMONIALS
// [08] TRUST BLOCK
// [09] LEAD CAPTURE FORM
// [10] FAQ
// [11] FOOTER
```

### Design Tokens en index.css

Los colores y estilos globales están definidos en `client/src/index.css`:

```css
:root {
  --color-mountain-dark: #1B5E20;
  --color-mountain-medium: #2E7D32;
  --color-mountain-light: #8BC34A;
  --color-mountain-surface: #F1F8E9;
}

/* Componentes reutilizables */
.btn-cta { /* Botón CTA principal */ }
.btn-cta-secondary { /* Botón CTA secundario */ }
.badge-free { /* Badge "GRATIS" */ }
.badge-coming { /* Badge "Próximamente" */ }
```

### Animaciones con Framer Motion

Las animaciones se implementan con `framer-motion`:

```tsx
<motion.h1
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, delay: 0 }}
>
  Certificá tu conocimiento de montaña.
</motion.h1>
```

## 🖼️ Imágenes y Activos

Las imágenes de alta calidad están alojadas en CDN. Para cambiar imágenes, edita las URLs en `Home.tsx`:

```tsx
style={{
  backgroundImage: "url('https://tu-nueva-imagen.com/imagen.webp')",
}}
```

## 🔧 Personalización

### Cambiar Colores

Edita las variables CSS en `client/src/index.css`:

```css
:root {
  --color-mountain-dark: #1B5E20;  /* Cambiar verde principal */
  --color-mountain-light: #8BC34A;  /* Cambiar verde acento */
}
```

### Cambiar Textos

Todos los textos están en `Home.tsx`. Busca las secciones comentadas y edita directamente:

```tsx
<h1>Certificá tu conocimiento de montaña.</h1>
```

### Agregar Nuevas Secciones

1. Crea un nuevo componente en `client/src/components/`
2. Importa en `Home.tsx`
3. Agrega la sección en el lugar deseado

## 📱 Responsividad

El sitio está optimizado para todos los tamaños de pantalla:

- **Mobile:** 375px (iPhone SE)
- **Tablet:** 768px (iPad)
- **Desktop:** 1024px+ (laptops)

Breakpoints de Tailwind CSS:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

## 🌐 Deploy

### Opción 1: Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Opción 2: Netlify

```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

### Opción 3: GitHub Pages

```bash
# Build
pnpm build

# Subir dist/ a GitHub Pages
```

## 📊 SEO

El sitio incluye meta tags optimizados en `client/index.html`:

```html
<title>CumbreCert — Certificación de Senderismo y Trekking en Argentina</title>
<meta name="description" content="El primer certificado digital para senderistas argentinos..." />
<meta property="og:title" content="CumbreCert — Certificá tu conocimiento de montaña" />
```

## 🔐 Seguridad

- ✅ Validación de formularios con React Hook Form + Zod
- ✅ HTTPS en todos los dominios
- ✅ No se almacenan datos sensibles en el cliente

## 🚀 Próximos Pasos

1. **Integración de Backend:** Conectar formulario de leads a Brevo/Mailchimp
2. **Plataforma de Cursos:** Agregar módulos de video, evaluaciones, generación de certificados PDF con QR
3. **App Móvil:** PWA o React Native con Expo
4. **Marketplace de Guías:** Directorio de guías certificados AAGM
5. **Sistema de Verificación QR:** Backend para verificar certificados en tiempo real

## 📞 Contacto

- **Email:** info@cumbrecert.com
- **Instagram:** @cumbrecert
- **TikTok:** @cumbrecert

---

**Última actualización:** Marzo 2026  
**Versión:** 1.0.0  
**Estado:** ✅ MVP Funcional
