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
import type * as ComAtprotoLabelDefs from '../../../com/atproto/label/defs'
import type * as ArCabildoabiertoEmbedVisualization from '../embed/visualization'

const is$typed = _is$typed,
  validate = _validate
const id = 'ar.cabildoabierto.feed.article'

export interface Record {
  $type: 'ar.cabildoabierto.feed.article'
  text: BlobRef
  format: string
  title: string
  embeds?: ArticleEmbed[]
  labels?: $Typed<ComAtprotoLabelDefs.SelfLabels> | { $type: string }
  createdAt: string
  [k: string]: unknown
}

const hashRecord = 'main'

export function isRecord<V>(v: V) {
  return is$typed(v, id, hashRecord)
}

export function validateRecord<V>(v: V) {
  return validate<Record & V>(v, id, hashRecord, true)
}

export interface ArticleEmbed {
  $type?: 'ar.cabildoabierto.feed.article#articleEmbed'
  value: $Typed<ArCabildoabiertoEmbedVisualization.Main> | { $type: string }
  index: number
}

const hashArticleEmbed = 'articleEmbed'

export function isArticleEmbed<V>(v: V) {
  return is$typed(v, id, hashArticleEmbed)
}

export function validateArticleEmbed<V>(v: V) {
  return validate<ArticleEmbed & V>(v, id, hashArticleEmbed)
}
