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

const is$typed = _is$typed,
  validate = _validate
const id = 'ar.cabildoabierto.embed.visualization'

export interface Main {
  $type?: 'ar.cabildoabierto.embed.visualization'
  spec:
    | $Typed<DatasetVisualization>
    | $Typed<HemicycleVisualization>
    | $Typed<TopicListVisualization>
    | { $type: string }
}

const hashMain = 'main'

export function isMain<V>(v: V) {
  return is$typed(v, id, hashMain)
}

export function validateMain<V>(v: V) {
  return validate<Main & V>(v, id, hashMain)
}

export interface DatasetVisualization {
  $type?: 'ar.cabildoabierto.embed.visualization#datasetVisualization'
  dataset?: string
  spec?:
    | $Typed<Barplot>
    | $Typed<Scatterplot>
    | $Typed<Histogram>
    | $Typed<Lines>
    | { $type: string }
  title?: string
}

const hashDatasetVisualization = 'datasetVisualization'

export function isDatasetVisualization<V>(v: V) {
  return is$typed(v, id, hashDatasetVisualization)
}

export function validateDatasetVisualization<V>(v: V) {
  return validate<DatasetVisualization & V>(v, id, hashDatasetVisualization)
}

export interface HemicycleVisualization {
  $type?: 'ar.cabildoabierto.embed.visualization#hemicycleVisualization'
}

const hashHemicycleVisualization = 'hemicycleVisualization'

export function isHemicycleVisualization<V>(v: V) {
  return is$typed(v, id, hashHemicycleVisualization)
}

export function validateHemicycleVisualization<V>(v: V) {
  return validate<HemicycleVisualization & V>(v, id, hashHemicycleVisualization)
}

export interface TopicListVisualization {
  $type?: 'ar.cabildoabierto.embed.visualization#topicListVisualization'
}

const hashTopicListVisualization = 'topicListVisualization'

export function isTopicListVisualization<V>(v: V) {
  return is$typed(v, id, hashTopicListVisualization)
}

export function validateTopicListVisualization<V>(v: V) {
  return validate<TopicListVisualization & V>(v, id, hashTopicListVisualization)
}

export interface Barplot {
  $type?: 'ar.cabildoabierto.embed.visualization#barplot'
  xlabel?: string
  ylabel?: string
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
  xlabel?: string
  ylabel?: string
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
  xlabel?: string
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
  xlabel?: string
  ylabel?: string
  normalized?: boolean
}

const hashLines = 'lines'

export function isLines<V>(v: V) {
  return is$typed(v, id, hashLines)
}

export function validateLines<V>(v: V) {
  return validate<Lines & V>(v, id, hashLines)
}
