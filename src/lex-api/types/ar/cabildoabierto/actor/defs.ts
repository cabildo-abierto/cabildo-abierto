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
import type * as AppBskyActorDefs from '../../../app/bsky/actor/defs'
import type * as ComAtprotoLabelDefs from '../../../com/atproto/label/defs'

const is$typed = _is$typed,
  validate = _validate
const id = 'ar.cabildoabierto.actor.defs'

export interface ProfileViewBasic {
  $type?: 'ar.cabildoabierto.actor.defs#profileViewBasic'
  did: string
  handle: string
  displayName?: string
  avatar?: string
  associated?: AppBskyActorDefs.ProfileAssociated
  viewer?: AppBskyActorDefs.ViewerState
  labels?: ComAtprotoLabelDefs.Label[]
  createdAt?: string
  caProfile?: string
  verification?: 'person' | 'org' | (string & {})
  editorStatus?:
    | 'Editor principiante'
    | 'Editor'
    | 'Administrador'
    | (string & {})
}

const hashProfileViewBasic = 'profileViewBasic'

export function isProfileViewBasic<V>(v: V) {
  return is$typed(v, id, hashProfileViewBasic)
}

export function validateProfileViewBasic<V>(v: V) {
  return validate<ProfileViewBasic & V>(v, id, hashProfileViewBasic)
}

export interface ProfileView {
  $type?: 'ar.cabildoabierto.actor.defs#profileView'
  did: string
  handle: string
  displayName?: string
  description?: string
  avatar?: string
  associated?: AppBskyActorDefs.ProfileAssociated
  indexedAt?: string
  createdAt?: string
  viewer?: AppBskyActorDefs.ViewerState
  labels?: ComAtprotoLabelDefs.Label[]
}

const hashProfileView = 'profileView'

export function isProfileView<V>(v: V) {
  return is$typed(v, id, hashProfileView)
}

export function validateProfileView<V>(v: V) {
  return validate<ProfileView & V>(v, id, hashProfileView)
}
