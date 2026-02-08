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
import type * as ArCabildoabiertoEmbedPoll from './poll.js'

const is$typed = _is$typed,
  validate = _validate
const id = 'ar.cabildoabierto.embed.pollVote'

export interface Main {
  $type: 'ar.cabildoabierto.embed.pollVote'
  /** The id of the poll that was voted on. */
  subjectId: string
  subjectPoll: ArCabildoabiertoEmbedPoll.Poll
  /** The label of the choice that was voted for. */
  choice: string
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
