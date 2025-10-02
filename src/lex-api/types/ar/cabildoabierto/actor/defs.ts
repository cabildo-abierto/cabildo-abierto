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
import type * as AppBskyGraphDefs from '../../../app/bsky/graph/defs'
import type * as ComAtprotoRepoStrongRef from '../../../com/atproto/repo/strongRef'

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
  caProfile?: string
  verification?: 'person' | 'org' | (string & {})
  editorStatus?:
    | 'Editor principiante'
    | 'Editor'
    | 'Administrador'
    | (string & {})
}

const hashProfileView = 'profileView'

export function isProfileView<V>(v: V) {
  return is$typed(v, id, hashProfileView)
}

export function validateProfileView<V>(v: V) {
  return validate<ProfileView & V>(v, id, hashProfileView)
}

export interface ProfileViewDetailed {
  $type?: 'ar.cabildoabierto.actor.defs#profileViewDetailed'
  did: string
  handle: string
  displayName?: string
  description?: string
  avatar?: string
  banner?: string
  followersCount?: number
  followsCount?: number
  bskyFollowersCount?: number
  bskyFollowsCount?: number
  postsCount?: number
  articlesCount?: number
  editsCount?: number
  associated?: AppBskyActorDefs.ProfileAssociated
  joinedViaStarterPack?: AppBskyGraphDefs.StarterPackViewBasic
  indexedAt?: string
  createdAt?: string
  viewer?: AppBskyActorDefs.ViewerState
  labels?: ComAtprotoLabelDefs.Label[]
  pinnedPost?: ComAtprotoRepoStrongRef.Main
  caProfile?: string
  verification?: 'person' | 'org' | (string & {})
  editorStatus?:
    | 'Editor principiante'
    | 'Editor'
    | 'Administrador'
    | (string & {})
}

const hashProfileViewDetailed = 'profileViewDetailed'

export function isProfileViewDetailed<V>(v: V) {
  return is$typed(v, id, hashProfileViewDetailed)
}

export function validateProfileViewDetailed<V>(v: V) {
  return validate<ProfileViewDetailed & V>(v, id, hashProfileViewDetailed)
}

export interface ProfileAssociated {
  $type?: 'ar.cabildoabierto.actor.defs#profileAssociated'
  lists?: number
  feedgens?: number
  starterPacks?: number
  labeler?: boolean
  chat?: AppBskyActorDefs.ProfileAssociatedChat
}

const hashProfileAssociated = 'profileAssociated'

export function isProfileAssociated<V>(v: V) {
  return is$typed(v, id, hashProfileAssociated)
}

export function validateProfileAssociated<V>(v: V) {
  return validate<ProfileAssociated & V>(v, id, hashProfileAssociated)
}
