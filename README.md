# CumbreCert 🏔️

**La primera plataforma argentina de certificación digital para senderistas.**

Respaldada por el CCAM (Centro Cultural Argentino de Montaña) y la AAGM. Permite a los usuarios estudiar módulos de formación, rendir exámenes y obtener un certificado digital con QR verificable.

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19 + Tailwind CSS 4 + shadcn/ui |
| Backend | Express 4 + tRPC 11 |
| Base de datos | MySQL 8 (local) / TiDB (producción) |
| ORM | Drizzle ORM |
| Auth | JWT con cookies HttpOnly |
| Testing | Vitest (20/20 tests) |
| Runtime | Node.js 22 + pnpm |

---

## Requisitos previos

Antes de levantar el proyecto localmente necesitás tener instalado:

- **Node.js 22+** → https://nodejs.org
- **pnpm** → `npm install -g pnpm`
- **MySQL 8** → ver instrucciones abajo según tu sistema operativo

---

## 1. Instalar MySQL 8 localmente

### macOS (con Homebrew)

```bash
# Instalar Homebrew si no lo tenés
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar MySQL 8
brew install mysql@8.0

# Iniciar el servicio
brew services start mysql@8.0

# Conectarse por primera vez (sin contraseña)
mysql -u root

# Dentro de MySQL: crear la base de datos y el usuario
CREATE DATABASE cumbrecert CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'cumbrecert'@'localhost' IDENTIFIED BY 'cumbrecert123';
GRANT ALL PRIVILEGES ON cumbrecert.* TO 'cumbrecert'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Windows

1. Descargá el instalador oficial: https://dev.mysql.com/downloads/installer/
2. Instalá **MySQL Server 8.0** con la opción "Developer Default"
3. Durante la instalación, configurá la contraseña de `root` (guardala)
4. Una vez instalado, abrí **MySQL Workbench** o la terminal y ejecutá:

```sql
CREATE DATABASE cumbrecert CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'cumbrecert'@'localhost' IDENTIFIED BY 'cumbrecert123';
GRANT ALL PRIVILEGES ON cumbrecert.* TO 'cumbrecert'@'localhost';
FLUSH PRIVILEGES;
```

### Linux (Ubuntu/Debian)

```bash
# Instalar MySQL 8
sudo apt update
sudo apt install mysql-server

# Iniciar el servicio
sudo systemctl start mysql
sudo systemctl enable mysql

# Configurar seguridad inicial
sudo mysql_secure_installation

# Crear base de datos y usuario
sudo mysql -u root -p

# Dentro de MySQL:
CREATE DATABASE cumbrecert CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'cumbrecert'@'localhost' IDENTIFIED BY 'cumbrecert123';
GRANT ALL PRIVILEGES ON cumbrecert.* TO 'cumbrecert'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 2. Clonar el repositorio

```bash
git clone https://github.com/mdejeann/Cumbrecert.git
cd Cumbrecert
```

---

## 3. Instalar dependencias

```bash
pnpm install
```

---

## 4. Configurar variables de entorno

Creá un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
# Base de datos MySQL local
DATABASE_URL=mysql://cumbrecert:cumbrecert123@localhost:3306/cumbrecert

# Secreto para firmar los JWT de sesión (podés poner cualquier string largo y aleatorio)
JWT_SECRET=mi_secreto_super_seguro_cumbrecert_2026

# OAuth de Manus (solo necesario para el login con Manus — podés dejarlo vacío en local)
VITE_APP_ID=
OAUTH_SERVER_URL=
VITE_OAUTH_PORTAL_URL=

# Estas variables son para producción en Manus — en local no son necesarias
BUILT_IN_FORGE_API_KEY=
BUILT_IN_FORGE_API_URL=
VITE_FRONTEND_FORGE_API_KEY=
VITE_FRONTEND_FORGE_API_URL=
VITE_ANALYTICS_ENDPOINT=
VITE_ANALYTICS_WEBSITE_ID=
VITE_APP_LOGO=
VITE_APP_TITLE=CumbreCert
OWNER_NAME=
OWNER_OPEN_ID=
```

> **Nota:** El archivo `.env` ya está en el `.gitignore` — nunca se sube al repositorio.

---

## 5. Crear las tablas en la base de datos

Drizzle ORM se encarga de generar y aplicar las migraciones automáticamente:

```bash
pnpm db:push
```

Este comando:
1. Lee el schema en `drizzle/schema.ts`
2. Genera los archivos SQL de migración en `drizzle/`
3. Aplica los cambios a tu base de datos local

Si todo salió bien, deberías ver algo como:
```
✓ Your SQL migration file ➜ drizzle/0000_....sql
[✓] migrations applied
```

Podés verificar que las tablas se crearon correctamente conectándote a MySQL:

```bash
mysql -u cumbrecert -pcumbrecert123 cumbrecert -e "SHOW TABLES;"
```

Deberías ver:
```
+----------------------+
| Tables_in_cumbrecert |
+----------------------+
| certificates         |
| course_progress      |
| module_progress      |
| users                |
+----------------------+
```

---

## 6. Iniciar el servidor de desarrollo

```bash
pnpm dev
```

Abrí tu navegador en: **http://localhost:3000**

---

## Estructura del proyecto

```
Cumbrecert/
├── client/                  ← Frontend React
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx         ← Landing page
│   │   │   ├── Register.tsx     ← Registro de usuario
│   │   │   ├── Login.tsx        ← Inicio de sesión
│   │   │   ├── Dashboard.tsx    ← Panel del usuario
│   │   │   ├── ModulePage.tsx   ← Módulo de curso + examen
│   │   │   └── FinalExam.tsx    ← Examen integrador + certificado
│   │   ├── components/          ← Componentes reutilizables (shadcn/ui)
│   │   └── lib/trpc.ts          ← Cliente tRPC
│   └── index.html
├── server/
│   ├── routers.ts           ← Todos los endpoints tRPC
│   ├── db.ts                ← Helpers de base de datos
│   └── _core/               ← Auth, OAuth, JWT (no modificar)
├── drizzle/
│   ├── schema.ts            ← Definición de tablas
│   └── *.sql                ← Archivos de migración generados
├── shared/                  ← Tipos y constantes compartidas
├── .env                     ← Variables de entorno (NO commitear)
├── drizzle.config.ts        ← Configuración de Drizzle
└── package.json
```

---

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Inicia el servidor de desarrollo con hot reload |
| `pnpm build` | Genera el build de producción |
| `pnpm test` | Corre los 20 tests de Vitest |
| `pnpm check` | Verifica tipos TypeScript |
| `pnpm db:push` | Genera y aplica migraciones de base de datos |
| `pnpm format` | Formatea el código con Prettier |

---

## Flujo de la plataforma

```
Landing (/) → Registro (/register) → Dashboard (/dashboard)
                                           ↓
                               Módulo 1 (/curso/0/modulo/1)
                               [Contenido + Examen 5 preguntas]
                                           ↓
                               Módulo 2 → 3 → 4 → 5
                               [Desbloqueo secuencial]
                                           ↓
                               Examen Final (/curso/0/examen-final)
                               [10 preguntas integradoras]
                                           ↓
                               Certificado QR (si aprueba ≥ 60%)
```

---

## Niveles de certificación

| Nivel | Nombre | Estado | Precio |
|-------|--------|--------|--------|
| Nivel 0 | Explorador Iniciante | ✅ Disponible | Gratis |
| Nivel 1 | Senderista Certificado | 🔜 Próximamente | USD 20 |
| Nivel 2 | Trekker Avanzado | 🔜 Próximamente | USD 50 |
| Nivel 3 | Montaña Responsable | 🔜 Próximamente | USD 100 |

---

## Módulos del Nivel 0

| # | Módulo | Temas |
|---|--------|-------|
| 1 | ¿Por qué caminamos en la montaña? | Historia, cultura, ética del senderismo |
| 2 | ¿Qué llevar? Equipamiento básico | Mochila, calzado, ropa, hidratación, nutrición |
| 3 | Clima y meteorología de montaña | Pronóstico, cambios bruscos, protocolo STOP |
| 4 | Orientación y señalización | Mapas, brújula, GPS, cairns, señales |
| 5 | Conducta en la montaña | Leave No Trace, fauna, flora, reglas de paso |

---

## Solución de problemas comunes

### Error: `ECONNREFUSED` al conectar a la base de datos

MySQL no está corriendo. Inicialo con:
- macOS: `brew services start mysql@8.0`
- Linux: `sudo systemctl start mysql`
- Windows: Abrí "Servicios" y buscá "MySQL80"

### Error: `Access denied for user 'cumbrecert'@'localhost'`

El usuario no fue creado correctamente. Conectate como root y ejecutá nuevamente:
```sql
CREATE USER 'cumbrecert'@'localhost' IDENTIFIED BY 'cumbrecert123';
GRANT ALL PRIVILEGES ON cumbrecert.* TO 'cumbrecert'@'localhost';
FLUSH PRIVILEGES;
```

### Error: `Table 'cumbrecert.users' doesn't exist`

Las migraciones no se aplicaron. Ejecutá:
```bash
pnpm db:push
```

### El puerto 3000 ya está en uso

Cambiá el puerto en tu `.env`:
```env
PORT=3001
```

---

## Contribuir

1. Hacé un fork del repositorio
2. Creá una rama: `git checkout -b feature/mi-feature`
3. Commiteá tus cambios: `git commit -m "feat: descripción"`
4. Pusheá: `git push origin feature/mi-feature`
5. Abrí un Pull Request

---

## Contacto

- **Email:** info@cumbrecert.com
- **Instagram:** @cumbrecert
- **Respaldo institucional:** [CCAM](https://ccam.org.ar) · AAGM · ISAGM

---

*© 2026 CumbreCert. Del senderista curioso al alpinista responsable.*
