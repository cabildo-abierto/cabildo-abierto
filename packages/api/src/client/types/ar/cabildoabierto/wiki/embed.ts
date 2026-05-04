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
import type * as ArCabildoabiertoEmbedVisualization from '../embed/visualization.js'
import type * as AppBskyEmbedImages from '../../../app/bsky/embed/images.js'
import type * as ArCabildoabiertoEmbedPoll from '../embed/poll.js'

const is$typed = _is$typed,
  validate = _validate
const id = 'ar.cabildoabierto.wiki.embed'

export interface Main {
  $type?: 'ar.cabildoabierto.wiki.embed'
  value:
    | $Typed<ArCabildoabiertoEmbedVisualization.Main>
    | $Typed<AppBskyEmbedImages.Main>
    | $Typed<ArCabildoabiertoEmbedPoll.Main>
    | { $type: string }
  index: number
}

const hashMain = 'main'

export function isMain<V>(v: V) {
  return is$typed(v, id, hashMain)
}

export function validateMain<V>(v: V) {
  return validate<Main & V>(v, id, hashMain)
}

export interface View {
  $type?: 'ar.cabildoabierto.wiki.embed#view'
  value:
    | $Typed<ArCabildoabiertoEmbedVisualization.Main>
    | $Typed<ArCabildoabiertoEmbedVisualization.View>
    | $Typed<AppBskyEmbedImages.View>
    | $Typed<ArCabildoabiertoEmbedPoll.Main>
    | $Typed<ArCabildoabiertoEmbedPoll.View>
    | { $type: string }
  index: number
}

const hashView = 'view'

export function isView<V>(v: V) {
  return is$typed(v, id, hashView)
}

export function validateView<V>(v: V) {
  return validate<View & V>(v, id, hashView)
}
