# Conjuntos de datos

Los bloques `dataset` se muestran en una sección debajo de Documentos. Tienen el
mismo sistema de versiones, comentarios y votos. En desktop abren una ventana
movible y redimensionable; en mobile, `/conjunto-de-datos/[versionId]`.

Se agregan desde el botón «Insertar conjunto de datos» de la toolbar del
párrafo, igual que los documentos. El formulario permite cargar un CSV o una URL.

## Publicación y almacenamiento

Aplicar `0002_datasets_1_2.sql` con `pnpm --filter backend migrate` antes de
iniciar el backend actualizado. La migración agrega `dataset` y su tipo de bloque;
`schema_2.sql` describe el esquema completo. No hay una segunda base de datos.

Cada versión guarda título, descripción, columnas ordenadas (nombre y tipo),
separador CSV y separador decimal. La fuente es un `file_id` o una `source_url`,
excluyentes. Los CSV subidos se guardan sin modificar en el bucket privado R2;
usan las mismas cuatro variables `CLOUDFLARE_*` de los documentos. Las subidas
son privadas hasta publicar un bloque que las use. Los archivos publicados se
pueden reutilizar; cambiar columnas o fuente crea una nueva versión al guardar.

Los CSV de URL no se guardan en R2. Se vuelven a descargar en cada apertura de la
tabla, sin cache ni actualizaciones por foco, movimiento de ventana o paginación.
Cada apertura representa una carga; los cambios posteriores en la URL se ven en
la siguiente apertura. Las versiones históricas mantienen sus columnas y tipos, pero leen el contenido
actual de la URL y vuelven a inferir sus separadores. Las columnas se emparejan por nombre: las
nuevas se ignoran y las ausentes muestran ERROR. Al editar se puede cargar la
fuente de nuevo y confirmar la estructura actual.

## Formato y límites

UTF-8 con BOM opcional, primera fila de encabezados únicos y no vacíos. Detecta
coma o punto y coma y admite comillas escapadas y saltos de línea en campos.
El separador CSV y el formato decimal se infieren automáticamente en cada carga.
Para el formato decimal se usa la puntuación predominante en los valores numéricos;
si no hay evidencia o hay empate, se usa punto. No se muestran selectores de separadores. Se rechazan filas con
distinta cantidad de campos. Líneas completamente vacías se ignoran.

`DATASET_MAX_MB=10` y `DATASET_MAX_CELLS=200000` son los valores predeterminados;
el límite de celdas incluye encabezados. Las descargas se acotan a 30 segundos
y tres redirecciones. Solo se permiten URLs HTTP/HTTPS públicas sin credenciales,
con validación DNS y de cada redirección. La respuesta debe ser un CSV sin
compresión. Las configuraciones Nginx del repositorio permiten cuerpos de hasta 25 MB en
las rutas API. Sincronizar y recargar esa configuración al desplegar; si se
aumenta el máximo del backend, ajustar también el proxy.

Tipos: texto, entero, decimal, booleano, fecha y fecha con hora. Se infieren de
los valores no vacíos y se pueden cambiar por columna. Valores heterogéneos o
identificadores con ceros iniciales quedan como texto. Un entero debe caber en
el rango de enteros seguros de JavaScript; los decimales rechazan precisión que
no puede representarse de forma segura (más de 15 dígitos significativos),
desbordamientos y valores no nulos que se convertirían en cero.

No se admiten separadores de miles. Booleanos: `true/false`, `sí/si/no` y `1/0`
al elegir ese tipo. Fechas: `YYYY-MM-DD` o `DD/MM/YYYY`; fechas con hora: ISO con
zona horaria. Las fechas deben ser reales. Celdas vacías se muestran como nulos;
valores incompatibles muestran ERROR y permiten consultar el original y el motivo.
Los errores de conversión no bloquean la publicación.

## API

- `POST /topics/:id/datasets/upload?name=datos.csv`: sesión requerida, cuerpo
  `application/octet-stream`; guarda el CSV y devuelve fuente, columnas, opciones
  y filas originales para la vista previa.
- `POST /topics/:id/datasets/preview`: sesión requerida; JSON con `fileId` o
  `sourceUrl`.
- `GET /dataset-versions/:id`: versión publicada, metadatos y celdas interpretadas
  con valor original, resultado y error. La respuesta lleva `Cache-Control: no-store`.
- `POST /topics/:id/edits`: publicación y edición del bloque mediante el flujo
  existente, con `typeId: "dataset"` y contenido JSON validado. El orden se normaliza a `n`.

La tabla muestra 100 filas por página. Cada consulta carga el conjunto acotado
completo; no hay consultas SQL sobre las filas ni importación de conjuntos grandes.
