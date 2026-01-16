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
import type * as AppBskyActorDefs from '../actor/defs.js'
import type * as AppBskyRichtextFacet from '../richtext/facet.js'
import type * as ComAtprotoLabelDefs from '../../../com/atproto/label/defs.js'
import type * as AppBskyGraphDefs from '../graph/defs.js'

const is$typed = _is$typed,
  validate = _validate
const id = 'app.bsky.feed.defs'

/** Metadata about the requesting account's relationship with the subject content. Only has meaningful content for authed requests. */
export interface ViewerState {
  $type?: 'app.bsky.feed.defs#viewerState'
  repost?: string
  like?: string
  threadMuted?: boolean
  replyDisabled?: boolean
  embeddingDisabled?: boolean
  pinned?: boolean
}

const hashViewerState = 'viewerState'

export function isViewerState<V>(v: V) {
  return is$typed(v, id, hashViewerState)
}

export function validateViewerState<V>(v: V) {
  return validate<ViewerState & V>(v, id, hashViewerState)
}

/** Metadata about this post within the context of the thread it is in. */
export interface ThreadContext {
  $type?: 'app.bsky.feed.defs#threadContext'
  rootAuthorLike?: string
}

const hashThreadContext = 'threadContext'

export function isThreadContext<V>(v: V) {
  return is$typed(v, id, hashThreadContext)
}

export function validateThreadContext<V>(v: V) {
  return validate<ThreadContext & V>(v, id, hashThreadContext)
}

export interface ReasonPin {
  $type?: 'app.bsky.feed.defs#reasonPin'
}

const hashReasonPin = 'reasonPin'

export function isReasonPin<V>(v: V) {
  return is$typed(v, id, hashReasonPin)
}

export function validateReasonPin<V>(v: V) {
  return validate<ReasonPin & V>(v, id, hashReasonPin)
}

export interface NotFoundPost {
  $type?: 'app.bsky.feed.defs#notFoundPost'
  uri: string
  notFound: true
}

const hashNotFoundPost = 'notFoundPost'

export function isNotFoundPost<V>(v: V) {
  return is$typed(v, id, hashNotFoundPost)
}

export function validateNotFoundPost<V>(v: V) {
  return validate<NotFoundPost & V>(v, id, hashNotFoundPost)
}

export interface BlockedPost {
  $type?: 'app.bsky.feed.defs#blockedPost'
  uri: string
  blocked: true
  author: BlockedAuthor
}

const hashBlockedPost = 'blockedPost'

export function isBlockedPost<V>(v: V) {
  return is$typed(v, id, hashBlockedPost)
}

export function validateBlockedPost<V>(v: V) {
  return validate<BlockedPost & V>(v, id, hashBlockedPost)
}

export interface BlockedAuthor {
  $type?: 'app.bsky.feed.defs#blockedAuthor'
  did: string
  viewer?: AppBskyActorDefs.ViewerState
}

const hashBlockedAuthor = 'blockedAuthor'

export function isBlockedAuthor<V>(v: V) {
  return is$typed(v, id, hashBlockedAuthor)
}

export function validateBlockedAuthor<V>(v: V) {
  return validate<BlockedAuthor & V>(v, id, hashBlockedAuthor)
}

export interface GeneratorView {
  $type?: 'app.bsky.feed.defs#generatorView'
  uri: string
  cid: string
  did: string
  creator: AppBskyActorDefs.ProfileView
  displayName: string
  description?: string
  descriptionFacets?: AppBskyRichtextFacet.Main[]
  avatar?: string
  likeCount?: number
  acceptsInteractions?: boolean
  labels?: ComAtprotoLabelDefs.Label[]
  viewer?: GeneratorViewerState
  contentMode?:
    | 'app.bsky.feed.defs#contentModeUnspecified'
    | 'app.bsky.feed.defs#contentModeVideo'
    | (string & {})
  indexedAt: string
}

const hashGeneratorView = 'generatorView'

export function isGeneratorView<V>(v: V) {
  return is$typed(v, id, hashGeneratorView)
}

export function validateGeneratorView<V>(v: V) {
  return validate<GeneratorView & V>(v, id, hashGeneratorView)
}

export interface GeneratorViewerState {
  $type?: 'app.bsky.feed.defs#generatorViewerState'
  like?: string
}

const hashGeneratorViewerState = 'generatorViewerState'

export function isGeneratorViewerState<V>(v: V) {
  return is$typed(v, id, hashGeneratorViewerState)
}

export function validateGeneratorViewerState<V>(v: V) {
  return validate<GeneratorViewerState & V>(v, id, hashGeneratorViewerState)
}

export interface ThreadgateView {
  $type?: 'app.bsky.feed.defs#threadgateView'
  uri?: string
  cid?: string
  record?: { [_ in string]: unknown }
  lists?: AppBskyGraphDefs.ListViewBasic[]
}

const hashThreadgateView = 'threadgateView'

export function isThreadgateView<V>(v: V) {
  return is$typed(v, id, hashThreadgateView)
}

export function validateThreadgateView<V>(v: V) {
  return validate<ThreadgateView & V>(v, id, hashThreadgateView)
}

export interface Interaction {
  $type?: 'app.bsky.feed.defs#interaction'
  item?: string
  event?:
    | 'app.bsky.feed.defs#requestLess'
    | 'app.bsky.feed.defs#requestMore'
    | 'app.bsky.feed.defs#clickthroughItem'
    | 'app.bsky.feed.defs#clickthroughAuthor'
    | 'app.bsky.feed.defs#clickthroughReposter'
    | 'app.bsky.feed.defs#clickthroughEmbed'
    | 'app.bsky.feed.defs#interactionSeen'
    | 'app.bsky.feed.defs#interactionLike'
    | 'app.bsky.feed.defs#interactionRepost'
    | 'app.bsky.feed.defs#interactionReply'
    | 'app.bsky.feed.defs#interactionQuote'
    | 'app.bsky.feed.defs#interactionShare'
    | (string & {})
  /** Context on a feed item that was originally supplied by the feed generator on getFeedSkeleton. */
  feedContext?: string
}

const hashInteraction = 'interaction'

export function isInteraction<V>(v: V) {
  return is$typed(v, id, hashInteraction)
}

export function validateInteraction<V>(v: V) {
  return validate<Interaction & V>(v, id, hashInteraction)
}

/** Request that less content like the given feed item be shown in the feed */
export const REQUESTLESS = `${id}#requestLess`
/** Request that more content like the given feed item be shown in the feed */
export const REQUESTMORE = `${id}#requestMore`
/** User clicked through to the feed item */
export const CLICKTHROUGHITEM = `${id}#clickthroughItem`
/** User clicked through to the author of the feed item */
export const CLICKTHROUGHAUTHOR = `${id}#clickthroughAuthor`
/** User clicked through to the reposter of the feed item */
export const CLICKTHROUGHREPOSTER = `${id}#clickthroughReposter`
/** User clicked through to the embedded content of the feed item */
export const CLICKTHROUGHEMBED = `${id}#clickthroughEmbed`
/** Declares the feed generator returns any types of posts. */
export const CONTENTMODEUNSPECIFIED = `${id}#contentModeUnspecified`
/** Declares the feed generator returns posts containing app.bsky.embed.video embeds. */
export const CONTENTMODEVIDEO = `${id}#contentModeVideo`
/** Feed item was seen by user */
export const INTERACTIONSEEN = `${id}#interactionSeen`
/** User liked the feed item */
export const INTERACTIONLIKE = `${id}#interactionLike`
/** User reposted the feed item */
export const INTERACTIONREPOST = `${id}#interactionRepost`
/** User replied to the feed item */
export const INTERACTIONREPLY = `${id}#interactionReply`
/** User quoted the feed item */
export const INTERACTIONQUOTE = `${id}#interactionQuote`
/** User shared the feed item */
export const INTERACTIONSHARE = `${id}#interactionShare`
