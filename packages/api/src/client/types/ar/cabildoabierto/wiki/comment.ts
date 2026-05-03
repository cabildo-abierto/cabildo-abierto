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
import type * as AppBskyRichtextFacet from '../../../app/bsky/richtext/facet.js'
import type * as ArCabildoabiertoFeedArticle from '../feed/article.js'
import type * as ComAtprotoRepoStrongRef from '../../../com/atproto/repo/strongRef.js'

const is$typed = _is$typed,
  validate = _validate
const id = 'ar.cabildoabierto.wiki.comment'

export interface Main {
  $type: 'ar.cabildoabierto.wiki.comment'
  text: string
  /** Menciones y urls en el formato de Bluesky. */
  facets?: AppBskyRichtextFacet.Main[]
  embeds?: ArCabildoabiertoFeedArticle.ArticleEmbed[]
  reply?: ReplyRef
  /** Fecha de creación del comentario declarada por el autor. */
  createdAt: string
  isChallenge?: boolean
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

export interface ReplyRef {
  $type?: 'ar.cabildoabierto.wiki.comment#replyRef'
  root: ComAtprotoRepoStrongRef.Main
  parent: ComAtprotoRepoStrongRef.Main
}

const hashReplyRef = 'replyRef'

export function isReplyRef<V>(v: V) {
  return is$typed(v, id, hashReplyRef)
}

export function validateReplyRef<V>(v: V) {
  return validate<ReplyRef & V>(v, id, hashReplyRef)
}
