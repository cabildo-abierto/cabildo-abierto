/* Generated from schemas/visualization/spec_v1.schema.json. */

/**
 * Variante discriminada por type.
 */
export type VisualizationChart = BarChart | LineChart | ScatterChart | HistogramChart | TableChart;
/**
 * Nombre exacto de una columna de la tabla tipada recibida. No es una expresión ni una ruta.
 */
export type FieldName = string;
/**
 * Etiqueta visible; si se omite, se deriva del campo.
 */
export type VisualizationLabel = string;
/**
 * Formato compatible con el tipo de la columna de la tabla recibida.
 */
export type ValueFormat = NumberFormat | PercentFormat | DateFormat;
export type HistogramBins = AutoBins | CountBins | BoundaryBins;

/**
 * Especificación de presentación de una tabla tipada: columnas con nombre y tipo de datos, y filas con valores correspondientes a esas columnas. Es independiente del origen de los datos.
 */
export interface VisualizationSpecV1 {
  schemaVersion: 1;
  /**
   * Título opcional de la visualización.
   */
  title?: string;
  /**
   * Descripción opcional de la visualización.
   */
  description?: string;
  chart: VisualizationChart;
  layout?: VisualizationLayout;
}
/**
 * Compara valores numéricos por categoría, sin agregarlos. Requiere una fila por categoría y seriesBy; los duplicados producen un error. Conserva el orden de aparición de las categorías. El eje cuantitativo lineal incluye cero.
 */
export interface BarChart {
  type: "bar";
  x: AxisField;
  /**
   * @minItems 1
   * @maxItems 12
   */
  series: VisualizationSeries[];
  /**
   * Orientación de las barras; x sigue representando la categoría.
   */
  orientation?: "vertical" | "horizontal";
  /**
   * Disposición de las series en cada categoría; stacked admite valores no negativos.
   */
  layout?: "grouped" | "stacked";
  yAxis?: AxisOptions;
  /**
   * Mostrar leyenda cuando hay más de una serie visible.
   */
  showLegend?: boolean;
  /**
   * Mostrar grilla del eje cuantitativo.
   */
  showGrid?: boolean;
  seriesBy?: FieldReference;
}
/**
 * Columna asignada a un eje y su presentación.
 */
export interface AxisField {
  field: FieldName;
  label?: VisualizationLabel;
  format?: ValueFormat;
  /**
   * Cantidad orientativa de marcas; el renderer puede reducirla para evitar solapamientos.
   */
  tickCount?: number;
  /**
   * Rotación de las etiquetas en grados; positivo en sentido horario.
   */
  tickLabelAngle?: number;
}
/**
 * Formato numérico con locale es-AR. La precisión afecta únicamente la presentación.
 */
export interface NumberFormat {
  type: "number";
  /**
   * Decimales visibles; omitido usa formato automático.
   */
  precision?: number;
}
/**
 * Formato porcentual: 0.25 se muestra como 25 %. No transforma los datos ni los ejes.
 */
export interface PercentFormat {
  type: "percent";
  /**
   * Decimales visibles.
   */
  precision?: number;
}
/**
 * Formato de fecha con locale es-AR y zona horaria UTC.
 */
export interface DateFormat {
  type: "date";
  /**
   * Nivel de detalle de la fecha.
   */
  style?: "date" | "datetime" | "month" | "year";
}
/**
 * Columna numérica de la tabla recibida. El orden de las series define su orden visible; todas comparten la escala Y.
 */
export interface VisualizationSeries {
  field: FieldName;
  label?: VisualizationLabel;
}
/**
 * Presentación de un eje. La escala se deriva del gráfico y del tipo de datos.
 */
export interface AxisOptions {
  label?: VisualizationLabel;
  format?: ValueFormat;
  /**
   * Cantidad orientativa de marcas; el renderer puede reducirla para evitar solapamientos.
   */
  tickCount?: number;
  /**
   * Rotación de las etiquetas en grados; positivo en sentido horario.
   */
  tickLabelAngle?: number;
}
/**
 * Separa series visuales según esta columna de la tabla recibida, sin agregar valores.
 */
export interface FieldReference {
  field: FieldName;
  label?: VisualizationLabel;
}
/**
 * Conecta observaciones por X ascendente con segmentos rectos, sin agregarlas. X debe ser numérico o temporal e Y numérico. Requiere una fila por X y seriesBy; los duplicados producen un error.
 */
export interface LineChart {
  type: "line";
  x: AxisField;
  /**
   * @minItems 1
   * @maxItems 12
   */
  series: VisualizationSeries[];
  yAxis?: AxisOptions;
  /**
   * Mostrar puntos además de los segmentos.
   */
  showPoints?: boolean;
  /**
   * Mostrar leyenda cuando hay más de una serie visible.
   */
  showLegend?: boolean;
  /**
   * Mostrar grilla.
   */
  showGrid?: boolean;
  seriesBy?: FieldReference1;
}
/**
 * Separa series visuales según esta columna de la tabla recibida, sin agregar valores.
 */
export interface FieldReference1 {
  field: FieldName;
  label?: VisualizationLabel;
}
/**
 * Un punto por fila con coordenadas numéricas; no agrega ni conecta puntos.
 */
export interface ScatterChart {
  type: "scatter";
  x: AxisField;
  y: AxisField;
  color?: FieldReference2;
  size?: FieldReference2;
  /**
   * Mostrar leyenda cuando se usa color por categoría.
   */
  showLegend?: boolean;
  /**
   * Mostrar grilla.
   */
  showGrid?: boolean;
}
/**
 * Columna de la tabla recibida utilizada para separar series o asignar color/tamaño; no agrupa ni agrega datos.
 */
export interface FieldReference2 {
  field: FieldName;
  label?: VisualizationLabel;
}
/**
 * Distribución de una columna numérica por intervalos; excluye valores nulos.
 */
export interface HistogramChart {
  type: "histogram";
  x: AxisField;
  bins?: HistogramBins;
  /**
   * count cuenta valores; relative divide por el total de valores no nulos de la columna de la tabla recibida.
   */
  frequency?: "count" | "relative";
  yAxis?: AxisOptions;
  /**
   * Mostrar grilla del eje de frecuencias.
   */
  showGrid?: boolean;
}
/**
 * Calcula intervalos de igual ancho usando la regla de Sturges, con un máximo de 100 intervalos.
 */
export interface AutoBins {
  mode: "auto";
}
/**
 * Divide el rango observado en esta cantidad de intervalos de igual ancho.
 */
export interface CountBins {
  mode: "count";
  /**
   * Cantidad de intervalos.
   */
  count: number;
}
/**
 * Límites estrictamente crecientes que deben cubrir los valores observados. Cada par consecutivo define un intervalo.
 */
export interface BoundaryBins {
  mode: "boundaries";
  /**
   * @minItems 2
   * @maxItems 101
   */
  boundaries: number[];
}
/**
 * Vista de la tabla tipada recibida. Conserva el orden de las filas; las columnas se muestran en el orden configurado.
 */
export interface TableChart {
  type: "table";
  /**
   * @minItems 1
   * @maxItems 200
   */
  columns: TableColumn[];
  /**
   * Filas de la tabla recibida por página.
   */
  pageSize?: number;
}
/**
 * Columna visible; label cambia solo el encabezado y format solo su presentación.
 */
export interface TableColumn {
  field: FieldName;
  label?: VisualizationLabel;
  format?: ValueFormat;
}
/**
 * Tamaño adaptable al ancho disponible. Tipografía, márgenes y paleta se resuelven desde el tema de Cabildo.
 */
export interface VisualizationLayout {
  /**
   * Relación ancho/alto del área del gráfico. En tablas determina la altura del área con scroll; la paginación queda fuera.
   */
  aspectRatio?: number;
}
