# API del Rancho Porvenir (NestJS) para Dokploy.
FROM node:24-alpine AS base
WORKDIR /app
# Versión fijada, como en samawe: sin ella el build toma el pnpm más reciente y
# un cambio de comportamiento de pnpm rompe la imagen sin tocar el repositorio.
RUN npm install -g pnpm@10

FROM base AS deps
# pnpm-workspace.yaml lleva la autorización del script de instalación de sharp;
# sin él pnpm aborta con ERR_PNPM_IGNORED_BUILDS.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM deps AS builder
COPY . .
RUN pnpm run build && pnpm prune --prod

FROM base AS production
ENV NODE_ENV=production
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
# Fotos subidas: montar aquí un volumen persistente en Dokploy
# (p. ej. /var/lib/dokploy/rancho-storage → /app/uploads). Sin él, cada
# despliegue borra las fotos.
RUN mkdir -p /app/uploads
EXPOSE 4000
# Variables: las del entorno del contenedor (ver .env.example). Las migraciones
# pendientes se aplican en cada arranque, como en samawe.
CMD ["sh", "-c", "pnpm run migration:run:prod && pnpm run start:prod"]
