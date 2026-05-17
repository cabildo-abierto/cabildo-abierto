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
import type * as ArCabildoabiertoActorDefs from '../actor/defs.js'
import type * as ComAtprotoRepoStrongRef from '../../../com/atproto/repo/strongRef.js'
import type * as ArCabildoabiertoWikiComment from './comment.js'
import type * as AppBskyFeedDefs from '../../../app/bsky/feed/defs.js'

const is$typed = _is$typed,
  validate = _validate
const id = 'ar.cabildoabierto.wiki.defs'

export interface VoteView {
  $type?: 'ar.cabildoabierto.wiki.defs#voteView'
  uri: string
  cid: string
  author: ArCabildoabiertoActorDefs.ProfileViewBasic
  subject: ComAtprotoRepoStrongRef.Main
}

const hashVoteView = 'voteView'

export function isVoteView<V>(v: V) {
  return is$typed(v, id, hashVoteView)
}

export function validateVoteView<V>(v: V) {
  return validate<VoteView & V>(v, id, hashVoteView)
}

export interface ThreadViewContent {
  $type?: 'ar.cabildoabierto.wiki.defs#threadViewContent'
  content:
    | $Typed<ArCabildoabiertoWikiComment.View>
    | $Typed<AppBskyFeedDefs.NotFoundPost>
    | $Typed<AppBskyFeedDefs.BlockedPost>
    | { $type: string }
  parent?:
    | $Typed<ThreadViewContent>
    | $Typed<AppBskyFeedDefs.NotFoundPost>
    | $Typed<AppBskyFeedDefs.BlockedPost>
    | { $type: string }
  replies?: (
    | $Typed<ThreadViewContent>
    | $Typed<AppBskyFeedDefs.NotFoundPost>
    | $Typed<AppBskyFeedDefs.BlockedPost>
    | { $type: string }
  )[]
}

const hashThreadViewContent = 'threadViewContent'

export function isThreadViewContent<V>(v: V) {
  return is$typed(v, id, hashThreadViewContent)
}

export function validateThreadViewContent<V>(v: V) {
  return validate<ThreadViewContent & V>(v, id, hashThreadViewContent)
}
