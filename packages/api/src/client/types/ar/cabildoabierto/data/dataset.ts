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
import type * as ArCabildoabiertoActorDefs from '../actor/defs.js'

const is$typed = _is$typed,
  validate = _validate
const id = 'ar.cabildoabierto.data.dataset'

export interface Main {
  $type: 'ar.cabildoabierto.data.dataset'
  name: string
  description?: string
  /** Client-declared timestamp when this post was originally created. */
  createdAt: string
  columns: Column[]
  data?: DataBlock[]
  [k: string]: unknown
}

const hashMain = 'main'

export function isMain<V>(v: V) {
  return is$typed(v, id, hashMain)
}

export function validateMain<V>(v: V) {
  return validate<Main & V>(v, id, hashMain, true)
}

export {
  type Main as Record,
  isMain as isRecord,
  validateMain as validateRecord,
}

export interface Column {
  $type?: 'ar.cabildoabierto.data.dataset#column'
  name: string
}

const hashColumn = 'column'

export function isColumn<V>(v: V) {
  return is$typed(v, id, hashColumn)
}

export function validateColumn<V>(v: V) {
  return validate<Column & V>(v, id, hashColumn)
}

export interface DataBlock {
  $type?: 'ar.cabildoabierto.data.dataset#dataBlock'
  blob: BlobRef
  format?: string
}

const hashDataBlock = 'dataBlock'

export function isDataBlock<V>(v: V) {
  return is$typed(v, id, hashDataBlock)
}

export function validateDataBlock<V>(v: V) {
  return validate<DataBlock & V>(v, id, hashDataBlock)
}

export interface DatasetViewBasic {
  $type?: 'ar.cabildoabierto.data.dataset#datasetViewBasic'
  name: string
  uri: string
  cid: string
  author: ArCabildoabiertoActorDefs.ProfileViewBasic
  /** Client-declared timestamp when this post was originally created. */
  createdAt: string
  description?: string
  columns: Column[]
  editedAt?: string
}

const hashDatasetViewBasic = 'datasetViewBasic'

export function isDatasetViewBasic<V>(v: V) {
  return is$typed(v, id, hashDatasetViewBasic)
}

export function validateDatasetViewBasic<V>(v: V) {
  return validate<DatasetViewBasic & V>(v, id, hashDatasetViewBasic)
}

export interface DatasetView {
  $type?: 'ar.cabildoabierto.data.dataset#datasetView'
  name: string
  uri: string
  cid: string
  author: ArCabildoabiertoActorDefs.ProfileViewBasic
  /** Client-declared timestamp when this post was originally created. */
  createdAt: string
  description?: string
  columns: Column[]
  data: string
  dataFormat?: string
  editedAt?: string
}

const hashDatasetView = 'datasetView'

export function isDatasetView<V>(v: V) {
  return is$typed(v, id, hashDatasetView)
}

export function validateDatasetView<V>(v: V) {
  return validate<DatasetView & V>(v, id, hashDatasetView)
}

export interface TopicsDatasetView {
  $type?: 'ar.cabildoabierto.data.dataset#topicsDatasetView'
  columns: Column[]
  data: string
  dataFormat?: string
}

const hashTopicsDatasetView = 'topicsDatasetView'

export function isTopicsDatasetView<V>(v: V) {
  return is$typed(v, id, hashTopicsDatasetView)
}

export function validateTopicsDatasetView<V>(v: V) {
  return validate<TopicsDatasetView & V>(v, id, hashTopicsDatasetView)
}
