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
import type * as ArCabildoabiertoActorDefs from '../actor/defs.js'

const is$typed = _is$typed,
  validate = _validate
const id = 'ar.cabildoabierto.embed.pollVote'

export interface Main {
  $type: 'ar.cabildoabierto.embed.pollVote'
  /** The id of the poll that was voted on. It can be either at://[did]/[collection]/[rkey]/[poll-key] or ca://[topicId]/[poll-key] */
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

export interface View {
  $type?: 'ar.cabildoabierto.embed.pollVote#view'
  author: ArCabildoabiertoActorDefs.ProfileViewBasic
  choice: string
}

const hashView = 'view'

export function isView<V>(v: V) {
  return is$typed(v, id, hashView)
}

export function validateView<V>(v: V) {
  return validate<View & V>(v, id, hashView)
}
