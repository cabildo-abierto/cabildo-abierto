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
import type * as AppBskyEmbedRecord from './record'
import type * as AppBskyEmbedImages from './images'
import type * as AppBskyEmbedVideo from './video'
import type * as AppBskyEmbedExternal from './external'

const is$typed = _is$typed,
  validate = _validate
const id = 'app.bsky.embed.recordWithMedia'

export interface Main {
  $type?: 'app.bsky.embed.recordWithMedia'
  record: AppBskyEmbedRecord.Main
  media:
    | $Typed<AppBskyEmbedImages.Main>
    | $Typed<AppBskyEmbedVideo.Main>
    | $Typed<AppBskyEmbedExternal.Main>
    | { $type: string }
}

const hashMain = 'main'

export function isMain<V>(v: V) {
  return is$typed(v, id, hashMain)
}

export function validateMain<V>(v: V) {
  return validate<Main & V>(v, id, hashMain)
}
