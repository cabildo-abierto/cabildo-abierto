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
 - PostgreSQL + Kysely.
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
pnpm --filter backend migrate
```

Las migraciones SQL y los snapshots del esquema se documentan en [apps/backend/schema/README.md](apps/backend/schema/README.md).

## Importar recursos de datos.gob.ar

Con las variables de entorno del backend configuradas y un tema y usuario existentes:

```bash
pnpm --filter backend run script:import-datos-gob-ar --topic ID_DEL_TEMA --user NOMBRE_DE_USUARIO
pnpm --filter backend run script:import-datos-gob-ar --topic ID_DEL_TEMA --user NOMBRE_DE_USUARIO --dry-run=metadata
pnpm --filter backend run script:import-datos-gob-ar --topic ID_DEL_TEMA --user NOMBRE_DE_USUARIO --apply
pnpm --filter backend run script:import-datos-gob-ar --topic ID_DEL_TEMA --user NOMBRE_DE_USUARIO --limit 10
```

El primer comando hace un dry-run completo: descarga y valida cada recurso CSV, pero no escribe en la base. El segundo consulta solo metadatos y muestra candidatos que aún requieren validación. `--apply` vuelve a validar y publica todas las altas y actualizaciones en una sola edición. Los recursos inaccesibles y los bloques intervenidos manualmente se conservan y se informan en el resumen.

`--limit N` procesa solo los primeros N recursos CSV del catálogo (ordenados por nombre de dataset), deja de consultar páginas al reunirlos y marca el informe como parcial. También se puede combinar con `--apply`. En ese modo no informa recursos ausentes del catálogo, porque solo examinó una muestra.

## Contribuir

Aceptamos contribuciones por medio de pull requests. Si tenés preguntas o querés colaborar también podés escribirnos por mensaje privado en Cabildo Abierto o Bluesky a @cabildoabierto.ar.

Si encontrás algún error podés abrir un issue o escribirnos.

### Datasets: Parquet y consultas remotas

Antes de arrancar esta versión, detener el backend y los workers y aplicar las migraciones pendientes con `pnpm --filter backend migrate`. La migración `0009_dataset_snapshots_8_9.sql` crea las tablas de fuentes y snapshots; `0010_dataset_source_reference_9_10.sql` completa las fuentes faltantes de todos los datasets (incluidas versiones históricas), establece la referencia obligatoria `dataset.source_id` y elimina `dataset.file_id` y `dataset.source_url`. Después, reiniciar los procesos con el código actualizado. El código anterior no es compatible con el esquema nuevo.

Cada fuente guarda la URL o el archivo de origen y puede compartirse entre versiones de datasets. Las fuentes se registran al crear datasets, subir archivos o preparar una vista previa; las lecturas usan fuentes existentes. La migración conserva los snapshots y validadores existentes, sin descargar CSV ni generar Parquet. Las fuentes todavía sin snapshot se preparan bajo demanda o mediante el comando de preparación anticipada.

En desarrollo, instalar la extensión oficial de la versión de DuckDB del backend una vez con `pnpm --filter backend datasets:httpfs`. La imagen Docker la instala durante su construcción; las consultas no pueden instalar extensiones. Si cambia la versión de DuckDB, volver a instalarla.

La lectura valida UTF-8 en el archivo completo. Si no es válido y no tiene una marca UTF-8 explícita, intenta Windows-1252 como alternativa para archivos occidentales antiguos (también compatible con los caracteres habituales de Latin-1). Esta alternativa es una inferencia; se rechazan bytes indefinidos y controles binarios. No se reemplazan caracteres inválidos silenciosamente.

Los CSV se convierten en streaming a Parquet en R2, conservando valores originales y un ordinal de fila. Las tablas piden páginas de 100 filas; las visualizaciones consultan columnas directamente mediante rangos HTTP. Los uploads conservan su CSV original; las URLs solo conservan Parquet. La búsqueda reutiliza el snapshot.

Las fuentes URL se verifican al consultarlas cuando pasaron 5 minutos desde la última comprobación exitosa. Se usan ETag/Last-Modified cuando están disponibles; sin validadores se descarga y compara el hash. La consulta espera la verificación/conversión y no sirve una copia vencida ante fallos. Las páginas siguientes quedan ligadas al snapshot inicial. Las tarjetas solo piden metadatos.

| Variable | Valor inicial | Uso |
| --- | --- | --- |
| `DATASET_MAX_MB` | 50 | Máximo del CSV, en MiB; reemplaza el límite de celdas de importación |
| `DATASET_FRESH_SECONDS` | 300 | Vigencia de una verificación URL |
| `DATASET_PREPARE_SECONDS` | 120 | Tiempo máximo del proceso de conversión |
| `DATASET_PREPARE_MEMORY_MB` | 512 | Memoria de DuckDB durante conversión |
| `DATASET_PREPARE_TEMP_MB` | 1024 | Espacio temporal de DuckDB durante conversión |
| `DATASET_QUERY_MAX_CELLS` | 10000000 | Estimación conservadora de celdas de entrada utilizadas |
| `DATASET_QUERY_MAX_MB` | 100 | Estimación de bytes comprimidos de columnas utilizadas, en MiB |
| `DATASET_RESULT_MAX_ROWS` | 100000 | Máximo de filas del resultado |
| `DATASET_RESULT_MAX_CELLS` | 200000 | Máximo de celdas del resultado |
| `DATASET_RESULT_MAX_MB` | 10 | Máximo del resultado JSON, en MiB |

Los presupuestos de entrada son estimaciones conservadoras, no contadores de bytes HTTP: incluyen columnas de filtros, joins y agrupaciones y no descuentan selectividad de filtros. Los metadatos de Parquet y reintentos también generan tráfico. Se mantienen 15 segundos y 256 MiB de memoria de DuckDB por consulta, con dos procesos simultáneos y cola de veinte. La descarga y la conversión inicial necesariamente leen el CSV completo. Los límites de memoria de DuckDB no incluyen todo el consumo del proceso Node.

Preparación anticipada, reanudable (omite fuentes ya preparadas):

```bash
pnpm --filter backend datasets:prepare --limit 10
```

Limpieza explícita de snapshots reemplazados hace más de 24 horas:

```bash
pnpm --filter backend datasets:prepare --cleanup --limit 100
```

Una sesión que intente usar un snapshot eliminado debe recargar. No se consultan periódicamente fuentes sin uso. Los logs `dataset_snapshot_published`, `dataset_source_unchanged` y `dataset_preparation_finished` incluyen identificadores y tiempos, nunca URLs firmadas.

El importador conserva sus modos `--dry-run=metadata`, dry-run completo y `--apply`. El dry-run completo convierte a Parquet temporal para validar, sin escribir snapshots en R2 ni en la base. `--apply` prepara las fuentes y reutiliza sus snapshots.
