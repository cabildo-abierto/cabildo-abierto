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
import type * as ArCabildoabiertoFeedArticle from '../feed/article'
import type * as ArCabildoabiertoActorDefs from '../actor/defs'

const is$typed = _is$typed,
  validate = _validate
const id = 'ar.cabildoabierto.embed.selectionQuote'

export interface Main {
  $type?: 'ar.cabildoabierto.embed.selectionQuote'
  start: number
  end: number
}

const hashMain = 'main'

export function isMain<V>(v: V) {
  return is$typed(v, id, hashMain)
}

export function validateMain<V>(v: V) {
  return validate<Main & V>(v, id, hashMain)
}

export interface View {
  $type?: 'ar.cabildoabierto.embed.selectionQuote#view'
  start: number
  end: number
  quotedText: string
  quotedTextFormat?: string
  quotedContent: string
  quotedContentEmbeds?: ArCabildoabiertoFeedArticle.ArticleEmbedView[]
  quotedContentAuthor: ArCabildoabiertoActorDefs.ProfileViewBasic
  quotedContentTitle?: string
}

const hashView = 'view'

export function isView<V>(v: V) {
  return is$typed(v, id, hashView)
}

export function validateView<V>(v: V) {
  return validate<View & V>(v, id, hashView)
}
