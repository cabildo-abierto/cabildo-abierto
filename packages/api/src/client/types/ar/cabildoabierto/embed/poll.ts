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
  id: string
  description?: string
  choices: PollChoice[]
}

const hashMain = 'main'

export function isMain<V>(v: V) {
  return is$typed(v, id, hashMain)
}

export function validateMain<V>(v: V) {
  return validate<Main & V>(v, id, hashMain)
}

export interface PollChoice {
  $type?: 'ar.cabildoabierto.embed.poll#pollChoice'
  label: string
  votes: number
}

const hashPollChoice = 'pollChoice'

export function isPollChoice<V>(v: V) {
  return is$typed(v, id, hashPollChoice)
}

export function validatePollChoice<V>(v: V) {
  return validate<PollChoice & V>(v, id, hashPollChoice)
}
