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

const is$typed = _is$typed,
  validate = _validate
const id = 'ar.cabildoabierto.embed.poll'

export interface Main {
  $type?: 'ar.cabildoabierto.embed.poll'
  /** Unique identifier of the poll within its container, obtained as a hash of the poll object. */
  key: string
  poll: Poll
}

const hashMain = 'main'

export function isMain<V>(v: V) {
  return is$typed(v, id, hashMain)
}

export function validateMain<V>(v: V) {
  return validate<Main & V>(v, id, hashMain)
}

export interface Poll {
  $type?: 'ar.cabildoabierto.embed.poll#poll'
  description?: string
  choices: PollChoice[]
}

const hashPoll = 'poll'

export function isPoll<V>(v: V) {
  return is$typed(v, id, hashPoll)
}

export function validatePoll<V>(v: V) {
  return validate<Poll & V>(v, id, hashPoll)
}

export interface PollChoice {
  $type?: 'ar.cabildoabierto.embed.poll#pollChoice'
  label: string
}

const hashPollChoice = 'pollChoice'

export function isPollChoice<V>(v: V) {
  return is$typed(v, id, hashPollChoice)
}

export function validatePollChoice<V>(v: V) {
  return validate<PollChoice & V>(v, id, hashPollChoice)
}

export interface View {
  $type?: 'ar.cabildoabierto.embed.poll#view'
  key: string
  poll: Poll
  viewer?: PollViewer
  votes: number[]
}

const hashView = 'view'

export function isView<V>(v: V) {
  return is$typed(v, id, hashView)
}

export function validateView<V>(v: V) {
  return validate<View & V>(v, id, hashView)
}

export interface PollViewer {
  $type?: 'ar.cabildoabierto.embed.poll#pollViewer'
  choice?: string
  voteUri?: string
}

const hashPollViewer = 'pollViewer'

export function isPollViewer<V>(v: V) {
  return is$typed(v, id, hashPollViewer)
}

export function validatePollViewer<V>(v: V) {
  return validate<PollViewer & V>(v, id, hashPollViewer)
}
