/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { type ValidationResult, BlobRef } from '@atproto/lexicon'
import { CID } from 'multiformats/cid'
import { validate as _validate } from '../../../../lexicons'
import {
  type $Typed,
  is$typed as _is$typed,
  type OmitKey,
} from '../../../../util'
import type * as ArCabildoabiertoDataDataset from '../data/dataset'

const is$typed = _is$typed,
  validate = _validate
const id = 'ar.cabildoabierto.embed.visualization'

export interface Main {
  $type?: 'ar.cabildoabierto.embed.visualization'
  dataSource:
    | $Typed<DatasetDataSource>
    | $Typed<TopicsDataSource>
    | { $type: string }
  filters?: ($Typed<ColumnFilter> | { $type: string })[]
  spec:
    | $Typed<Hemicycle>
    | $Typed<TwoAxisPlot>
    | $Typed<OneAxisPlot>
    | $Typed<Table>
    | { $type: string }
  title?: string
  caption?: string
  /** Un número de punto flotante que determina la proporción del ancho sobre el alto. */
  aspectRatio?: string
}

const hashMain = 'main'

export function isMain<V>(v: V) {
  return is$typed(v, id, hashMain)
}

export function validateMain<V>(v: V) {
  return validate<Main & V>(v, id, hashMain)
}

export interface DatasetDataSource {
  $type?: 'ar.cabildoabierto.embed.visualization#datasetDataSource'
  dataset: string
}

const hashDatasetDataSource = 'datasetDataSource'

export function isDatasetDataSource<V>(v: V) {
  return is$typed(v, id, hashDatasetDataSource)
}

export function validateDatasetDataSource<V>(v: V) {
  return validate<DatasetDataSource & V>(v, id, hashDatasetDataSource)
}

export interface TopicsDataSource {
  $type?: 'ar.cabildoabierto.embed.visualization#topicsDataSource'
}

const hashTopicsDataSource = 'topicsDataSource'

export function isTopicsDataSource<V>(v: V) {
  return is$typed(v, id, hashTopicsDataSource)
}

export function validateTopicsDataSource<V>(v: V) {
  return validate<TopicsDataSource & V>(v, id, hashTopicsDataSource)
}

export interface ColumnFilter {
  $type?: 'ar.cabildoabierto.embed.visualization#columnFilter'
  column: string
  operator: string
  operands?: string[]
}

const hashColumnFilter = 'columnFilter'

export function isColumnFilter<V>(v: V) {
  return is$typed(v, id, hashColumnFilter)
}

export function validateColumnFilter<V>(v: V) {
  return validate<ColumnFilter & V>(v, id, hashColumnFilter)
}

export interface Hemicycle {
  $type?: 'ar.cabildoabierto.embed.visualization#hemicycle'
}

const hashHemicycle = 'hemicycle'

export function isHemicycle<V>(v: V) {
  return is$typed(v, id, hashHemicycle)
}

export function validateHemicycle<V>(v: V) {
  return validate<Hemicycle & V>(v, id, hashHemicycle)
}

export interface Table {
  $type?: 'ar.cabildoabierto.embed.visualization#table'
  /** Se puede usar para mostrar solo algunas de las columnas y para opcionalmente renombrar algunas. */
  columns?: TableVisualizationColumn[]
}

const hashTable = 'table'

export function isTable<V>(v: V) {
  return is$typed(v, id, hashTable)
}

export function validateTable<V>(v: V) {
  return validate<Table & V>(v, id, hashTable)
}

export interface TableVisualizationColumn {
  $type?: 'ar.cabildoabierto.embed.visualization#tableVisualizationColumn'
  columnName: string
  alias?: string
}

const hashTableVisualizationColumn = 'tableVisualizationColumn'

export function isTableVisualizationColumn<V>(v: V) {
  return is$typed(v, id, hashTableVisualizationColumn)
}

export function validateTableVisualizationColumn<V>(v: V) {
  return validate<TableVisualizationColumn & V>(
    v,
    id,
    hashTableVisualizationColumn,
  )
}

export interface TwoAxisPlot {
  $type?: 'ar.cabildoabierto.embed.visualization#twoAxisPlot'
  xAxis: string
  xLabel?: string
  yAxis: string
  yLabel?: string
  dimensions?: PlotDimensions
  plot:
    | $Typed<Barplot>
    | $Typed<Lines>
    | $Typed<Scatterplot>
    | { $type: string }
}

const hashTwoAxisPlot = 'twoAxisPlot'

export function isTwoAxisPlot<V>(v: V) {
  return is$typed(v, id, hashTwoAxisPlot)
}

export function validateTwoAxisPlot<V>(v: V) {
  return validate<TwoAxisPlot & V>(v, id, hashTwoAxisPlot)
}

export interface OneAxisPlot {
  $type?: 'ar.cabildoabierto.embed.visualization#oneAxisPlot'
  xAxis: string
  xLabel?: string
  dimensions?: PlotDimensions
  plot: $Typed<Histogram> | { $type: string }
}

const hashOneAxisPlot = 'oneAxisPlot'

export function isOneAxisPlot<V>(v: V) {
  return is$typed(v, id, hashOneAxisPlot)
}

export function validateOneAxisPlot<V>(v: V) {
  return validate<OneAxisPlot & V>(v, id, hashOneAxisPlot)
}

export interface PlotDimensions {
  $type?: 'ar.cabildoabierto.embed.visualization#plotDimensions'
  /** El ángulo de las etiquetas del eje x. 0 es horizontal y aumenta en sentido antihorario (0-360). */
  xTickLabelsAngle?: number
  xLabelFontSize?: number
  xTickLabelsFontSize?: number
  xTicksCount?: number
  xLabelOffset?: number
  yTicksCount?: number
  yLabelOffset?: number
  yLabelFontSize?: number
  yTickLabelsFontSize?: number
  marginBottom?: number
  marginLeft?: number
}

const hashPlotDimensions = 'plotDimensions'

export function isPlotDimensions<V>(v: V) {
  return is$typed(v, id, hashPlotDimensions)
}

export function validatePlotDimensions<V>(v: V) {
  return validate<PlotDimensions & V>(v, id, hashPlotDimensions)
}

export interface Histogram {
  $type?: 'ar.cabildoabierto.embed.visualization#histogram'
}

const hashHistogram = 'histogram'

export function isHistogram<V>(v: V) {
  return is$typed(v, id, hashHistogram)
}

export function validateHistogram<V>(v: V) {
  return validate<Histogram & V>(v, id, hashHistogram)
}

export interface Lines {
  $type?: 'ar.cabildoabierto.embed.visualization#lines'
}

const hashLines = 'lines'

export function isLines<V>(v: V) {
  return is$typed(v, id, hashLines)
}

export function validateLines<V>(v: V) {
  return validate<Lines & V>(v, id, hashLines)
}

export interface Scatterplot {
  $type?: 'ar.cabildoabierto.embed.visualization#scatterplot'
}

const hashScatterplot = 'scatterplot'

export function isScatterplot<V>(v: V) {
  return is$typed(v, id, hashScatterplot)
}

export function validateScatterplot<V>(v: V) {
  return validate<Scatterplot & V>(v, id, hashScatterplot)
}

export interface Barplot {
  $type?: 'ar.cabildoabierto.embed.visualization#barplot'
}

const hashBarplot = 'barplot'

export function isBarplot<V>(v: V) {
  return is$typed(v, id, hashBarplot)
}

export function validateBarplot<V>(v: V) {
  return validate<Barplot & V>(v, id, hashBarplot)
}

export interface View {
  $type?: 'ar.cabildoabierto.embed.visualization#view'
  visualization: Main
  dataset:
    | $Typed<ArCabildoabiertoDataDataset.DatasetView>
    | $Typed<ArCabildoabiertoDataDataset.TopicsDatasetView>
    | { $type: string }
}

const hashView = 'view'

export function isView<V>(v: V) {
  return is$typed(v, id, hashView)
}

export function validateView<V>(v: V) {
  return validate<View & V>(v, id, hashView)
}
