# Cabildo Abierto

¡Hola!

Este repositorio contiene la implementación de https://cabildoabierto.ar, una plataforma de discusión argentina.

## Estructura

```
 - apps/web: sitio web (Next.js).
 - apps/backend/index.ts: API (Express)
 - apps/backend/mirror.ts: sincronización con ATProto usando Jetstream.
 - apps/backend/worker.ts: worker de BullMQ.
 - packages/api: cliente de ATProto con los lexicons de Cabildo Abierto (autogenerado) + tipos de la API interna.
 - packages/utils: utils (Node.js plano).
 - packages/editor-core: primitivas del editor (Node.js plano).
 - lexicons: lexicons de Cabildo Abierto.
```

El stack utilizado incluye:
 - Next.js (typescript).
 - Shadcn + Tailwind CSS (UI).
 - Lexical (editor).
 - Visx + d3 (visualizaciones).
 - Express (typescript).
 - PostgreSQL + Prisma + Kysely.
 - Redis (IORedis).
 - BullMQ.

## Instalación

Requerimientos:
 - Node.js 20
 - pnpm (`npm install --global pnpm`).
 - Variables de ambiente en apps/web y apps/backend.

Ejecutar frontend y backend:
```
pnpm install
pnpm run dev
```

Inicializar una base de datos de desarrollo:
```
npx prisma migrate dev
```

## Contribuir

Aceptamos contribuciones por medio de pull requests. Si tenés preguntas o querés colaborar también podés escribirnos por mensaje privado en Cabildo Abierto o Bluesky a @cabildoabierto.ar.

Si encontrás algún error podés abrir un issue o escribirnos.
