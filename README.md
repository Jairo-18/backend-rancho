# backend-rancho

API del Hotel Rancho Ecológico: NestJS 12 + TypeORM + PostgreSQL.

- Rutas bajo `/api/v1` · Swagger en `/api/docs` (Basic Auth con `SWAGGER_USER` / `SWAGGER_PASSWORD`)
- Respuestas exitosas: `{ data }` · Errores: `{ statusCode, error, message, details?, path, timestamp }`
- Fotos subidas servidas en `/uploads/...`

## Puesta en marcha

```bash
cp .env.example .env.development   # completar DB_*, JWT_*, SWAGGER_* y SEED_*
pnpm install
pnpm run migration:run             # crea / actualiza las tablas
pnpm run seed                      # admin + datos de ejemplo (idempotente)
pnpm run start:dev                 # http://localhost:4000/api/v1
```

El `.env.example` está agrupado por secciones (`# APP`, `# CORS`, `# DATABASE`, `# JWT`, `# SWAGGER`, `# UPLOADS`, `# SEED`) y comenta cada variable. La app valida todas las variables al arrancar y no inicia si falta alguna. Se carga `.env.development` o `.env.production` según `NODE_ENV`; las variables del entorno (Dokploy) tienen prioridad.

## Scripts

| Script | Qué hace |
|---|---|
| `pnpm run start:dev` | Servidor con recarga automática |
| `pnpm run build` / `start:prod` | Compilar y ejecutar en producción |
| `pnpm run lint` / `format` | oxlint (type-aware) / Prettier |
| `pnpm test` | Tests unitarios (Vitest) |
| `pnpm run test:e2e` | Flujo completo contra la base de `.env.development` (limpia lo que crea) |
| `pnpm run migration:generate -- src/database/migrations/Nombre` | Genera una migración a partir de los cambios en las entidades |
| `pnpm run migration:run` / `migration:revert` / `migration:show` | Aplica / revierte / lista migraciones |
| `pnpm run migration:run:prod` | Aplica migraciones en **producción** (usa `.env.production`; requiere `pnpm run build` antes) |
| `pnpm run seed` | Datos de ejemplo: 1 admin, 3 cabañas, 2 cabalgatas, 4 productos, festivos de Colombia |

## Estructura (como samawe)

```
typeorm.config.ts      DataSource del CLI de migraciones y del seed
src/
├── main.ts            arranque (+ app.setup.ts: helmet, CORS, Swagger, pipes, /uploads)
├── config.ts          variables de entorno validadas + config() agrupada (app, db, jwt, swagger, uploads)
├── app.module.ts
├── shared/            SharedModule.forRoot() global: base de datos, entidades, repositorios, guard JWT
│   ├── entities/  repositories/  guards/  decorators/  dtos/
│   ├── filters/  interceptors/  interfaces/  utils/
├── <módulo>/          auth · rooms · price-rules · pricing · horseback · products · settings · uploads · health
│   ├── controllers/   xxx.controller.ts (admin) y xxx-public.controller.ts
│   ├── useCases/      xxxUC.uc.ts — orquesta los servicios
│   ├── services/      lógica y acceso a datos (repositorios de shared/)
│   ├── dtos/  decorators/ (documentación Swagger)  constants/
│   └── xxx.module.ts
├── migrations/
└── seeds/
```

Flujo de una petición: **controller → useCase → service(s) → repository**.

## Endpoints

| Método | Ruta | Acceso |
|---|---|---|
| GET | `/health` | público |
| POST | `/auth/login` · `/auth/refresh` | público (login: 5 intentos/min) |
| POST | `/auth/logout` · GET `/auth/me` | admin |
| GET | `/settings/public` | público |
| PUT | `/settings` | admin |
| GET | `/rooms` · `/rooms/:slug` | público (solo activas) |
| GET | `/rooms/admin?search=&status=all\|active\|inactive` · `/rooms/admin/:id` | admin |
| POST · PATCH · DELETE | `/rooms` · `/rooms/:id` · `/rooms/:id` (desactiva) | admin |
| POST | `/rooms/:id/images` (multipart, UNA foto en `file`) | admin |
| PATCH | `/rooms/:id/images/reorder` | admin |
| DELETE | `/rooms/:id/images/:imageId` | admin |
| GET | `/pricing/quote?roomId=&checkIn=&checkOut=` | público |
| GET · POST · PATCH · DELETE | `/price-rules` · `/price-rules/:id` | admin |
| GET | `/horseback` · `/horseback/:slug` | público (solo activas) |
| GET | `/horseback/admin` · `/horseback/admin/:id` | admin |
| POST · PATCH · DELETE | `/horseback` · `/horseback/:id` | admin |
| POST · PATCH · DELETE | `/horseback/:id/images` · `/horseback/:id/images/reorder` · `/horseback/:id/images/:imageId` | admin |
| GET | `/products` | público (solo activos) |
| GET | `/products/admin` · `/products/admin/:id` | admin |
| POST · PATCH · DELETE | `/products` · `/products/:id` | admin |
| PUT | `/products/:id/image` (UNA foto en `file`) | admin |

## Despliegue (Dokploy)

`Dockerfile` multi-etapa (pnpm@10 fijado). El build sale en `dist/src/main.js` y `dist/typeorm.config.js`. Al arrancar aplica las migraciones pendientes y levanta la API en el puerto 4000.
Montar un **volumen persistente en `/app/uploads`** (p. ej. `/var/lib/dokploy/storage/ranchoporvenir-prod/uploads`) y poner `UPLOADS_DIR=/app/uploads`; sin el volumen, cada despliegue borra las fotos.
