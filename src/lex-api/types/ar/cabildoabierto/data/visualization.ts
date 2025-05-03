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
const id = 'ar.cabildoabierto.data.visualization'

export interface Main {
  $type?: 'ar.cabildoabierto.data.visualization'
  spec:
    | $Typed<DatasetVisualization>
    | $Typed<HemicycleVisualization>
    | $Typed<TopicListVisualization>
    | { $type: string }
  /** Client-declared timestamp when this post was originally created. */
  createdAt: string
}

const hashMain = 'main'

export function isMain<V>(v: V) {
  return is$typed(v, id, hashMain)
}

export function validateMain<V>(v: V) {
  return validate<Main & V>(v, id, hashMain)
}

export interface DatasetVisualization {
  $type?: 'ar.cabildoabierto.data.visualization#datasetVisualization'
  dataset?: string
  spec?:
    | $Typed<Barplot>
    | $Typed<Scatterplot>
    | $Typed<Histogram>
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
  $type?: 'ar.cabildoabierto.data.visualization#hemicycleVisualization'
}

const hashHemicycleVisualization = 'hemicycleVisualization'

export function isHemicycleVisualization<V>(v: V) {
  return is$typed(v, id, hashHemicycleVisualization)
}

export function validateHemicycleVisualization<V>(v: V) {
  return validate<HemicycleVisualization & V>(v, id, hashHemicycleVisualization)
}

export interface TopicListVisualization {
  $type?: 'ar.cabildoabierto.data.visualization#topicListVisualization'
}

const hashTopicListVisualization = 'topicListVisualization'

export function isTopicListVisualization<V>(v: V) {
  return is$typed(v, id, hashTopicListVisualization)
}

export function validateTopicListVisualization<V>(v: V) {
  return validate<TopicListVisualization & V>(v, id, hashTopicListVisualization)
}

export interface Barplot {
  $type?: 'ar.cabildoabierto.data.visualization#barplot'
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
  $type?: 'ar.cabildoabierto.data.visualization#scatterplot'
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
  $type?: 'ar.cabildoabierto.data.visualization#histogram'
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
