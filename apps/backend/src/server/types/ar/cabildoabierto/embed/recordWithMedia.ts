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
import type * as ArCabildoabiertoEmbedRecord from './record.js'
import type * as AppBskyEmbedImages from '../../../app/bsky/embed/images.js'
import type * as AppBskyEmbedVideo from '../../../app/bsky/embed/video.js'
import type * as AppBskyEmbedExternal from '../../../app/bsky/embed/external.js'

const is$typed = _is$typed,
  validate = _validate
const id = 'ar.cabildoabierto.embed.recordWithMedia'

export interface View {
  $type?: 'ar.cabildoabierto.embed.recordWithMedia#view'
  record: ArCabildoabiertoEmbedRecord.View
  media:
    | $Typed<AppBskyEmbedImages.View>
    | $Typed<AppBskyEmbedVideo.View>
    | $Typed<AppBskyEmbedExternal.View>
    | { $type: string }
}

const hashView = 'view'

export function isView<V>(v: V) {
  return is$typed(v, id, hashView)
}

export function validateView<V>(v: V) {
  return validate<View & V>(v, id, hashView)
}
