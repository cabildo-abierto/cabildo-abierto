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
const id = 'ar.cabildoabierto.actor.defs'

export interface ProfileViewBasic {
  $type?: 'ar.cabildoabierto.actor.defs#profileViewBasic'
  did: string
  handle: string
  displayName?: string
  avatar?: string
  createdAt?: string
  caProfile?: string
  verification?: 'person' | 'org' | (string & {})
  description?: string
}

const hashProfileViewBasic = 'profileViewBasic'

export function isProfileViewBasic<V>(v: V) {
  return is$typed(v, id, hashProfileViewBasic)
}

export function validateProfileViewBasic<V>(v: V) {
  return validate<ProfileViewBasic & V>(v, id, hashProfileViewBasic)
}

export interface ProfileViewDetailed {
  $type?: 'ar.cabildoabierto.actor.defs#profileViewDetailed'
  did: string
  handle: string
  displayName?: string
  description?: string
  avatar?: string
  consensusCount?: number
  commentsCount?: number
  editsCount?: number
  indexedAt?: string
  createdAt?: string
  caProfile?: string
  verification?: 'person' | 'org' | (string & {})
}

const hashProfileViewDetailed = 'profileViewDetailed'

export function isProfileViewDetailed<V>(v: V) {
  return is$typed(v, id, hashProfileViewDetailed)
}

export function validateProfileViewDetailed<V>(v: V) {
  return validate<ProfileViewDetailed & V>(v, id, hashProfileViewDetailed)
}
