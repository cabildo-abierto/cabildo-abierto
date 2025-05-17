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
  spec:
    | $Typed<Hemicycle>
    | $Typed<Barplot>
    | $Typed<Scatterplot>
    | $Typed<Histogram>
    | $Typed<Lines>
    | $Typed<Table>
    | { $type: string }
  title?: string
  caption?: string
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
}

const hashTable = 'table'

export function isTable<V>(v: V) {
  return is$typed(v, id, hashTable)
}

export function validateTable<V>(v: V) {
  return validate<Table & V>(v, id, hashTable)
}

export interface Barplot {
  $type?: 'ar.cabildoabierto.embed.visualization#barplot'
  xAxis?: string
  yAxis?: string
  xLabel?: string
  yLabel?: string
}

const hashBarplot = 'barplot'

export function isBarplot<V>(v: V) {
  return is$typed(v, id, hashBarplot)
}

export function validateBarplot<V>(v: V) {
  return validate<Barplot & V>(v, id, hashBarplot)
}

export interface Scatterplot {
  $type?: 'ar.cabildoabierto.embed.visualization#scatterplot'
  xAxis?: string
  yAxis?: string
  xLabel?: string
  yLabel?: string
}

const hashScatterplot = 'scatterplot'

export function isScatterplot<V>(v: V) {
  return is$typed(v, id, hashScatterplot)
}

export function validateScatterplot<V>(v: V) {
  return validate<Scatterplot & V>(v, id, hashScatterplot)
}

export interface Histogram {
  $type?: 'ar.cabildoabierto.embed.visualization#histogram'
  xAxis?: string
  yAxis?: string
  xLabel?: string
  normalized?: boolean
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
  xAxis?: string
  yAxis?: string
  xLabel?: string
  yLabel?: string
}

const hashLines = 'lines'

export function isLines<V>(v: V) {
  return is$typed(v, id, hashLines)
}

export function validateLines<V>(v: V) {
  return validate<Lines & V>(v, id, hashLines)
}

export interface View {
  $type?: 'ar.cabildoabierto.embed.visualization#view'
  dataSource:
    | $Typed<DatasetDataSource>
    | $Typed<TopicsDataSource>
    | { $type: string }
  spec:
    | $Typed<Hemicycle>
    | $Typed<Barplot>
    | $Typed<Scatterplot>
    | $Typed<Histogram>
    | $Typed<Lines>
    | $Typed<Table>
    | { $type: string }
  title?: string
  caption?: string
  dataset: ArCabildoabiertoDataDataset.DatasetView
}

const hashView = 'view'

export function isView<V>(v: V) {
  return is$typed(v, id, hashView)
}

export function validateView<V>(v: V) {
  return validate<View & V>(v, id, hashView)
}
