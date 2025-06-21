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
import type * as ComAtprotoRepoStrongRef from '../../../com/atproto/repo/strongRef'
import type * as ArCabildoabiertoFeedDefs from '../feed/defs'

const is$typed = _is$typed,
  validate = _validate
const id = 'ar.cabildoabierto.embed.record'

export interface Main {
  $type?: 'ar.cabildoabierto.embed.record'
  record: ComAtprotoRepoStrongRef.Main
}

const hashMain = 'main'

export function isMain<V>(v: V) {
  return is$typed(v, id, hashMain)
}

export function validateMain<V>(v: V) {
  return validate<Main & V>(v, id, hashMain)
}

export interface View {
  $type?: 'ar.cabildoabierto.embed.record#view'
  record:
    | $Typed<ArCabildoabiertoFeedDefs.PostView>
    | $Typed<ArCabildoabiertoFeedDefs.ArticleView>
    | { $type: string }
}

const hashView = 'view'

export function isView<V>(v: V) {
  return is$typed(v, id, hashView)
}

export function validateView<V>(v: V) {
  return validate<View & V>(v, id, hashView)
}
