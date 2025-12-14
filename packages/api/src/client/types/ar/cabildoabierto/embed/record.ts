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
import type * as AppBskyEmbedRecord from '../../../app/bsky/embed/record.js'
import type * as ArCabildoabiertoActorDefs from '../actor/defs.js'
import type * as ComAtprotoLabelDefs from '../../../com/atproto/label/defs.js'
import type * as AppBskyEmbedImages from '../../../app/bsky/embed/images.js'
import type * as AppBskyEmbedVideo from '../../../app/bsky/embed/video.js'
import type * as AppBskyEmbedExternal from '../../../app/bsky/embed/external.js'
import type * as ArCabildoabiertoEmbedRecordWithMedia from './recordWithMedia.js'

const is$typed = _is$typed,
  validate = _validate
const id = 'ar.cabildoabierto.embed.record'

export interface View {
  $type?: 'ar.cabildoabierto.embed.record#view'
  record:
    | $Typed<ViewRecord>
    | $Typed<ViewArticleRecord>
    | $Typed<AppBskyEmbedRecord.ViewNotFound>
    | $Typed<AppBskyEmbedRecord.ViewBlocked>
    | $Typed<AppBskyEmbedRecord.ViewDetached>
    | { $type: string }
}

const hashView = 'view'

export function isView<V>(v: V) {
  return is$typed(v, id, hashView)
}

export function validateView<V>(v: V) {
  return validate<View & V>(v, id, hashView)
}

export interface ViewRecord {
  $type?: 'ar.cabildoabierto.embed.record#viewRecord'
  uri: string
  cid: string
  author: ArCabildoabiertoActorDefs.ProfileViewBasic
  /** The record data itself. */
  value: { [_ in string]: unknown }
  labels?: ComAtprotoLabelDefs.Label[]
  replyCount?: number
  repostCount?: number
  likeCount?: number
  quoteCount?: number
  embeds?: (
    | $Typed<AppBskyEmbedImages.View>
    | $Typed<AppBskyEmbedVideo.View>
    | $Typed<AppBskyEmbedExternal.View>
    | $Typed<View>
    | $Typed<ArCabildoabiertoEmbedRecordWithMedia.View>
    | { $type: string }
  )[]
  indexedAt: string
}

const hashViewRecord = 'viewRecord'

export function isViewRecord<V>(v: V) {
  return is$typed(v, id, hashViewRecord)
}

export function validateViewRecord<V>(v: V) {
  return validate<ViewRecord & V>(v, id, hashViewRecord)
}

export interface ViewArticleRecord {
  $type?: 'ar.cabildoabierto.embed.record#viewArticleRecord'
  uri: string
  cid: string
  author: ArCabildoabiertoActorDefs.ProfileViewBasic
  /** The record data itself. */
  value: { [_ in string]: unknown }
  labels?: ComAtprotoLabelDefs.Label[]
  replyCount?: number
  repostCount?: number
  likeCount?: number
  quoteCount?: number
  embeds?: (
    | $Typed<AppBskyEmbedImages.View>
    | $Typed<AppBskyEmbedVideo.View>
    | $Typed<AppBskyEmbedExternal.View>
    | $Typed<View>
    | $Typed<ArCabildoabiertoEmbedRecordWithMedia.View>
    | { $type: string }
  )[]
  preview?: AppBskyEmbedImages.ViewImage
  indexedAt: string
  /** El resumen del artículo que se muestra en el muro. */
  summary?: string
}

const hashViewArticleRecord = 'viewArticleRecord'

export function isViewArticleRecord<V>(v: V) {
  return is$typed(v, id, hashViewArticleRecord)
}

export function validateViewArticleRecord<V>(v: V) {
  return validate<ViewArticleRecord & V>(v, id, hashViewArticleRecord)
}
