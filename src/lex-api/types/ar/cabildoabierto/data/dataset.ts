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
const id = 'ar.cabildoabierto.data.dataset'

export interface Record {
  $type: 'ar.cabildoabierto.data.dataset'
  name: string
  /** Client-declared timestamp when this post was originally created. */
  createdAt: string
  columns: Column[]
  [k: string]: unknown
}

const hashRecord = 'main'

export function isRecord<V>(v: V) {
  return is$typed(v, id, hashRecord)
}

export function validateRecord<V>(v: V) {
  return validate<Record & V>(v, id, hashRecord, true)
}

export interface Column {
  $type?: 'ar.cabildoabierto.data.dataset#column'
  name: string
  datatype?: string
}

const hashColumn = 'column'

export function isColumn<V>(v: V) {
  return is$typed(v, id, hashColumn)
}

export function validateColumn<V>(v: V) {
  return validate<Column & V>(v, id, hashColumn)
}
