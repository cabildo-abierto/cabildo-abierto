# Esquema y migraciones

Se requiere PostgreSQL 18. Kysely usa los tipos mantenidos en `src/db/types.ts`.

Desde la raíz: `pnpm --filter backend migrate`. Lee `apps/backend/.env`, prefiere
`DIRECT_URL` y usa `DATABASE_URL` si no está definida. Las variables exportadas
prevalecen sobre el archivo. Comprobar el destino antes de ejecutar.
En la imagen de backend: `node dist/scripts/apply-migrations.js`, desde `/app`.
Las migraciones no se ejecutan al iniciar la API.

## Agregar un cambio

1. Conservar los archivos existentes: las migraciones aplicadas son inmutables.
2. Agregar `migrations/0002_nombre_del_cambio_1_2.sql` y el snapshot completo
   `schemas/schema_2.sql`; continuar con `0003_nombre_2_3.sql`, etc.
3. Actualizar los tipos Kysely cuando cambien las tablas.
4. Verificar en una base descartable y aplicar antes de desplegar el código.

El prefijo tiene cuatro dígitos consecutivos desde `0001`. El nombre usa minúsculas,
números y guiones bajos. La primera migración va de `empty` a `1`; cada siguiente
incrementa la versión en uno. Los archivos se ordenan lexicográficamente.
Los snapshots describen el esquema completo y los catálogos iniciales, sin datos
de usuarios ni filas del historial de migraciones. No se aplican automáticamente.

Cada archivo SQL y su registro en `public.migration` se ejecutan en una única
transacción. Si falla, se revierte ese archivo y se detiene el proceso con código
no cero; las migraciones anteriores quedan aplicadas. Un advisory lock por
transacción serializa los migradores, incluso con pooler. El historial debe ser
un prefijo de los archivos locales: no se admite borrar ni renombrar migraciones
aplicadas. Los archivos vacíos o con secuencias inválidas se rechazan.

Los archivos SQL **no deben** contener `BEGIN`, `COMMIT`, `ROLLBACK` ni otras
instrucciones de control de transacciones; tampoco operaciones incompatibles
con transacciones como `CREATE INDEX CONCURRENTLY` o `VACUUM`. El migrador es
quien controla la transacción. No se generan automáticamente migraciones inversas.

## Inicio del historial

`0001_initial_empty_1.sql` crea el esquema actual y los catálogos `record_type` y
`block_type` en una base vacía. Incluye la tabla `migration` con UUID, fecha de
ejecución y nombre de archivo único.

Las bases existentes de dev y prod se adoptan una sola vez: con respaldo y
verificación de equivalencia del esquema, crear la tabla `migration`, completar
el tipo `documento`, registrar `0001_initial_empty_1.sql` y retirar la antigua
tabla de seguimiento, todo en una transacción. No ejecutar el SQL inicial sobre
las tablas existentes ni marcar como aplicada una migración sin verificar el esquema.
