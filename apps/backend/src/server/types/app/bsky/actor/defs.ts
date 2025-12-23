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
import type * as ComAtprotoLabelDefs from '../../../com/atproto/label/defs.js'
import type * as AppBskyGraphDefs from '../graph/defs.js'
import type * as ComAtprotoRepoStrongRef from '../../../com/atproto/repo/strongRef.js'

const is$typed = _is$typed,
  validate = _validate
const id = 'app.bsky.actor.defs'

export interface ProfileViewBasic {
  $type?: 'app.bsky.actor.defs#profileViewBasic'
  did: string
  handle: string
  displayName?: string
  avatar?: string
  associated?: ProfileAssociated
  viewer?: ViewerState
  labels?: ComAtprotoLabelDefs.Label[]
  createdAt?: string
}

const hashProfileViewBasic = 'profileViewBasic'

export function isProfileViewBasic<V>(v: V) {
  return is$typed(v, id, hashProfileViewBasic)
}

export function validateProfileViewBasic<V>(v: V) {
  return validate<ProfileViewBasic & V>(v, id, hashProfileViewBasic)
}

export interface ProfileView {
  $type?: 'app.bsky.actor.defs#profileView'
  did: string
  handle: string
  displayName?: string
  description?: string
  avatar?: string
  associated?: ProfileAssociated
  indexedAt?: string
  createdAt?: string
  viewer?: ViewerState
  labels?: ComAtprotoLabelDefs.Label[]
}

const hashProfileView = 'profileView'

export function isProfileView<V>(v: V) {
  return is$typed(v, id, hashProfileView)
}

export function validateProfileView<V>(v: V) {
  return validate<ProfileView & V>(v, id, hashProfileView)
}

export interface ProfileViewDetailed {
  $type?: 'app.bsky.actor.defs#profileViewDetailed'
  did: string
  handle: string
  displayName?: string
  description?: string
  avatar?: string
  banner?: string
  followersCount?: number
  followsCount?: number
  postsCount?: number
  associated?: ProfileAssociated
  joinedViaStarterPack?: AppBskyGraphDefs.StarterPackViewBasic
  indexedAt?: string
  createdAt?: string
  viewer?: ViewerState
  labels?: ComAtprotoLabelDefs.Label[]
  pinnedPost?: ComAtprotoRepoStrongRef.Main
}

const hashProfileViewDetailed = 'profileViewDetailed'

export function isProfileViewDetailed<V>(v: V) {
  return is$typed(v, id, hashProfileViewDetailed)
}

export function validateProfileViewDetailed<V>(v: V) {
  return validate<ProfileViewDetailed & V>(v, id, hashProfileViewDetailed)
}

export interface ProfileAssociated {
  $type?: 'app.bsky.actor.defs#profileAssociated'
  lists?: number
  feedgens?: number
  starterPacks?: number
  labeler?: boolean
  chat?: ProfileAssociatedChat
}

const hashProfileAssociated = 'profileAssociated'

export function isProfileAssociated<V>(v: V) {
  return is$typed(v, id, hashProfileAssociated)
}

export function validateProfileAssociated<V>(v: V) {
  return validate<ProfileAssociated & V>(v, id, hashProfileAssociated)
}

export interface ProfileAssociatedChat {
  $type?: 'app.bsky.actor.defs#profileAssociatedChat'
  allowIncoming: 'all' | 'none' | 'following' | (string & {})
}

const hashProfileAssociatedChat = 'profileAssociatedChat'

export function isProfileAssociatedChat<V>(v: V) {
  return is$typed(v, id, hashProfileAssociatedChat)
}

export function validateProfileAssociatedChat<V>(v: V) {
  return validate<ProfileAssociatedChat & V>(v, id, hashProfileAssociatedChat)
}

/** Metadata about the requesting account's relationship with the subject account. Only has meaningful content for authed requests. */
export interface ViewerState {
  $type?: 'app.bsky.actor.defs#viewerState'
  muted?: boolean
  mutedByList?: AppBskyGraphDefs.ListViewBasic
  blockedBy?: boolean
  blocking?: string
  blockingByList?: AppBskyGraphDefs.ListViewBasic
  following?: string
  followedBy?: string
  knownFollowers?: KnownFollowers
}

const hashViewerState = 'viewerState'

export function isViewerState<V>(v: V) {
  return is$typed(v, id, hashViewerState)
}

export function validateViewerState<V>(v: V) {
  return validate<ViewerState & V>(v, id, hashViewerState)
}

/** The subject's followers whom you also follow */
export interface KnownFollowers {
  $type?: 'app.bsky.actor.defs#knownFollowers'
  count: number
  followers: ProfileViewBasic[]
}

const hashKnownFollowers = 'knownFollowers'

export function isKnownFollowers<V>(v: V) {
  return is$typed(v, id, hashKnownFollowers)
}

export function validateKnownFollowers<V>(v: V) {
  return validate<KnownFollowers & V>(v, id, hashKnownFollowers)
}
