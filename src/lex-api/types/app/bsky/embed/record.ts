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
import type * as ComAtprotoRepoStrongRef from '../../../com/atproto/repo/strongRef'
import type * as AppBskyFeedDefs from '../feed/defs'

const is$typed = _is$typed,
  validate = _validate
const id = 'app.bsky.embed.record'

export interface Main {
  $type?: 'app.bsky.embed.record'
  record: ComAtprotoRepoStrongRef.Main
}

const hashMain = 'main'

export function isMain<V>(v: V) {
  return is$typed(v, id, hashMain)
}

export function validateMain<V>(v: V) {
  return validate<Main & V>(v, id, hashMain)
}

export interface ViewNotFound {
  $type?: 'app.bsky.embed.record#viewNotFound'
  uri: string
  notFound: true
}

const hashViewNotFound = 'viewNotFound'

export function isViewNotFound<V>(v: V) {
  return is$typed(v, id, hashViewNotFound)
}

export function validateViewNotFound<V>(v: V) {
  return validate<ViewNotFound & V>(v, id, hashViewNotFound)
}

export interface ViewBlocked {
  $type?: 'app.bsky.embed.record#viewBlocked'
  uri: string
  blocked: true
  author: AppBskyFeedDefs.BlockedAuthor
}

const hashViewBlocked = 'viewBlocked'

export function isViewBlocked<V>(v: V) {
  return is$typed(v, id, hashViewBlocked)
}

export function validateViewBlocked<V>(v: V) {
  return validate<ViewBlocked & V>(v, id, hashViewBlocked)
}

export interface ViewDetached {
  $type?: 'app.bsky.embed.record#viewDetached'
  uri: string
  detached: true
}

const hashViewDetached = 'viewDetached'

export function isViewDetached<V>(v: V) {
  return is$typed(v, id, hashViewDetached)
}

export function validateViewDetached<V>(v: V) {
  return validate<ViewDetached & V>(v, id, hashViewDetached)
}
