# Documentos

Los temas admiten bloques `documento` con título (1–200 caracteres), descripción opcional (hasta 5000 caracteres) y un archivo. Se muestran por número de incorporación `d-N`, antes de las notas al pie; no participan del orden de párrafos.

Cada `Document` pertenece a exactamente una `BlockVersion`: comparten clave primaria y `document.id` es una FK obligatoria a `block_version.id`. Document no es un Record ni tiene referencias directas a Block, Topic o Edit. La autoría y fecha se obtienen del record del edit de su única versión.

Cada edición que modifica un bloque documental crea un Document nuevo junto a la BlockVersion, incluyendo cambios de metadatos y eliminación/restauración. Los Document almacenan título, descripción y `file_id`; pueden compartir File. La API serializa estos datos como `content` del bloque, pero no los duplica en `block_version.content`.

File almacena formato, original y referencia/estado del PDF derivado. Los bloques CA inmutables pertenecen al File. Sus comentarios se comparten entre versiones que usan ese archivo dentro del mismo tema. Cada comentario tiene como raíz el edit de la versión desde la cual se publicó. Se puede responder y eliminar comentarios de otra versión usando la versión actual; reemplazar el archivo separa las conversaciones. Los comentarios internos nunca aparecen en las conversaciones del título ni del bloque contenedor.

## Formatos

PDF; documentos de texto DOC, DOCX, ODT y RTF; TXT; MD/Markdown; JSON CA. No se admiten URLs, planillas ni presentaciones. Texto en UTF-8. Office conserva el original y genera un PDF con LibreOffice; no hay conversión automática a CA.

El formato CA es `{ "format": "cabildo-document", "version": 1, "blocks": [...] }`. Cada bloque tiene `typeId` (`parrafo`, `h1` o `h2`) y `content`. Los encabezados usan texto plano sin saltos de línea; los párrafos usan texto o un objeto `cabildo-rich-text` versión 1. Los identificadores de bloques se generan al importar. Máximo 10 000 bloques; se aplican los límites del rich text de los temas. Ver [ejemplo](document-example.json).

## Configuración

Variables del backend:

- `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_ACCESS_KEY_ID`, `CLOUDFLARE_SECRET_ACCESS_KEY`, `CLOUDFLARE_BUCKET`: bucket R2 privado y credenciales con acceso de lectura/escritura.
- `DOCUMENT_MAX_MB=25`: límite en MiB para PDF y Office.
- `DOCUMENT_TEXT_MAX_MB=5`: límite en MiB para TXT, Markdown y CA.
- `LIBREOFFICE_PATH=libreoffice`: ejecutable para desarrollo local; Docker incluye Writer y fuentes Noto/Liberation.

Las subidas pasan por el backend en binario. Configurar el proxy para aceptar el límite elegido y esperar al menos 90 segundos en la ruta de subida/conversión. El almacenamiento no requiere acceso público ni CORS para subida directa. Los enlaces de lectura se firman por 15 minutos y no se almacenan en la base de datos.

La conversión tiene un máximo de 60 segundos y una conversión simultánea por proceso, sin cola. Si el conversor está ocupado o falla, se conserva el original y el autor puede reintentar desde la página del documento. Un proceso interrumpido puede dejar una vista previa pendiente; el mismo botón permite reintentar. Las fuentes y el soporte de LibreOffice pueden producir diferencias visuales respecto del original. El proceso recibe un entorno mínimo, perfil temporal con macros deshabilitadas y limpieza de temporales.

## Base de datos y despliegue

El esquema inicial SQL y los tipos Kysely incluyen el modelo documental. Antes de arrancar el backend, ejecutar `pnpm --filter backend migrate`. El esquema incluye:

- Tablas `file`, `document`, `document_block` y sus relaciones/índices.
- `document.id` como PK y FK a `block_version.id`; `document.file_id`, título y descripción.
- `file.format`, `preview_file_id`, `preview_status`, `preview_error`; la vista previa referencia otro File.
- `document_block.file_id` y unicidad por archivo/posición.
- `comment.document_block_id` nullable, con FK e índice.

El backend registra idempotentemente el tipo de bloque `documento` al publicar el primero. No crea un tipo de record documental. No desplegar el código contra un esquema sin actualizar.

Si se aplicó el modelo anterior, la adaptación de datos debe crear un Document por cada BlockVersion documental usando su ID y sus metadatos, conservar la referencia al File y trasladar al File la conversión y los bloques CA. Los comentarios con raíz en antiguos records documentales necesitan asociarse a un edit referenciador del archivo dentro del mismo tema; reconstruir sus referencias raíz y respuestas directas antes de retirar esos records. Cuando un documento anterior fue usado por varios edits no se puede recuperar con exactitud el edit desde el que se comentó: resolver esa correspondencia al preparar la adaptación. Retirar `block_version.document_id`, las relaciones documentales con Topic/Record y los campos de conversión anteriores. No se incluye ni ejecuta una migración automática.

Subir crea File y sus bloques CA, sin Document ni Record. Guardar crea el edit, las versiones y los documentos en una transacción. Solo el autor puede incorporar una subida privada; un archivo ya publicado puede reutilizarse. Las rutas de documentos requieren una versión publicada, incluidas versiones rechazadas o reemplazadas. Eliminar un edit no oculta los comentarios del archivo desde otras versiones publicadas. Quitar un bloque no borra sus archivos; las subidas abandonadas permanecen privadas y esta versión no implementa su recolección automática.

## Interfaces

- `POST /topics/:id/documents?name=archivo.ext`: sesión requerida; cuerpo binario `application/octet-stream`. Devuelve `fileId`, nombre y eventual error de vista previa.
- Guardar el bloque mediante el endpoint de ediciones existente, `typeId: "documento"`, `content: JSON.stringify({fileId, title, description})`. El backend normaliza `order` a `n`.
- `GET /document-versions/:id`: metadatos, texto o bloques CA de una versión publicada.
- `GET /documents/:id/file`: descarga; `?preview=true` muestra PDF original o derivado.
- `POST /documents/:id/preview`: reintenta conversión del archivo compartido; solo autor de la versión.
- `GET/POST /documents/:id/blocks/:blockId/comments` y `DELETE .../comments/:commentId`: conversaciones CA sin votos, respuestas limitadas al mismo bloque y eliminación propia.

Página web: `/documento/[blockVersionId]`.

## Comprobación manual

Subir un archivo de cada formato; rechazar JSON incorrecto, formatos ajenos, archivos vacíos y tamaños excesivos. Comprobar vista previa, descarga y fallo/reintento de Office. Publicar un tema solo con documentos y uno con párrafos/notas. Editar metadatos, reemplazar archivo, comentar dos bloques CA y responder/eliminar; comprobar que comentarios y versiones anteriores se conservan sin mezclarse. Probar votos sobre la versión contenedora, eliminación/restauración y edición concurrente. Comprobar que otro usuario no accede a una subida privada.
