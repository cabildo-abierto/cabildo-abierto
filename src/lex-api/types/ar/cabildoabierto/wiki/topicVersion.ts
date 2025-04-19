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
const id = 'ar.cabildoabierto.wiki.topicVersion'

export interface Record {
  $type: 'ar.cabildoabierto.wiki.topicVersion'
  id: string
  text: BlobRef
  synonyms?: string
  categories?: string
  message?: string
  title?: string
  format: string
  createdAt: string
  $type?: 'ar.cabildoabierto.wiki.topicVersion'
  [k: string]: unknown
}

const hashRecord = 'main'

export function isRecord<V>(v: V) {
  return is$typed(v, id, hashRecord)
}

export function validateRecord<V>(v: V) {
  return validate<Record & V>(v, id, hashRecord, true)
}
