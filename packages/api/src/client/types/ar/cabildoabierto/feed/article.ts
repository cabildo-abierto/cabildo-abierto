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
import type * as ComAtprotoLabelDefs from '../../../com/atproto/label/defs.js'
import type * as ArCabildoabiertoEmbedVisualization from '../embed/visualization.js'
import type * as AppBskyEmbedImages from '../../../app/bsky/embed/images.js'
import type * as ArCabildoabiertoEmbedPoll from '../embed/poll.js'

const is$typed = _is$typed,
  validate = _validate
const id = 'ar.cabildoabierto.feed.article'

export interface Main {
  $type: 'ar.cabildoabierto.feed.article'
  text: BlobRef
  format: string
  title: string
  description?: string
  preview?: BlobRef
  embeds?: ArticleEmbed[]
  labels?: $Typed<ComAtprotoLabelDefs.SelfLabels> | { $type: string }
  createdAt: string
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

export interface ArticleEmbed {
  $type?: 'ar.cabildoabierto.feed.article#articleEmbed'
  value:
    | $Typed<ArCabildoabiertoEmbedVisualization.Main>
    | $Typed<AppBskyEmbedImages.Main>
    | $Typed<ArCabildoabiertoEmbedPoll.Main>
    | { $type: string }
  index: number
}

const hashArticleEmbed = 'articleEmbed'

export function isArticleEmbed<V>(v: V) {
  return is$typed(v, id, hashArticleEmbed)
}

export function validateArticleEmbed<V>(v: V) {
  return validate<ArticleEmbed & V>(v, id, hashArticleEmbed)
}

export interface ArticleEmbedView {
  $type?: 'ar.cabildoabierto.feed.article#articleEmbedView'
  value:
    | $Typed<ArCabildoabiertoEmbedVisualization.Main>
    | $Typed<ArCabildoabiertoEmbedVisualization.View>
    | $Typed<AppBskyEmbedImages.View>
    | $Typed<ArCabildoabiertoEmbedPoll.Main>
    | $Typed<ArCabildoabiertoEmbedPoll.View>
    | { $type: string }
  index: number
}

const hashArticleEmbedView = 'articleEmbedView'

export function isArticleEmbedView<V>(v: V) {
  return is$typed(v, id, hashArticleEmbedView)
}

export function validateArticleEmbedView<V>(v: V) {
  return validate<ArticleEmbedView & V>(v, id, hashArticleEmbedView)
}
