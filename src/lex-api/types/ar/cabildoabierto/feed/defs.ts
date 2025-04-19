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
import type * as AppBskyFeedDefs from '../../../app/bsky/feed/defs.js'
import type * as AppBskyActorDefs from '../../../app/bsky/actor/defs.js'
import type * as AppBskyEmbedImages from '../../../app/bsky/embed/images.js'
import type * as AppBskyEmbedVideo from '../../../app/bsky/embed/video.js'
import type * as AppBskyEmbedExternal from '../../../app/bsky/embed/external.js'
import type * as AppBskyEmbedRecord from '../../../app/bsky/embed/record.js'
import type * as AppBskyEmbedRecordWithMedia from '../../../app/bsky/embed/recordWithMedia.js'
import type * as ArCabildoabiertoEmbedSelectionQuote from '../embed/selectionQuote.js'
import type * as ComAtprotoLabelDefs from '../../../com/atproto/label/defs.js'

const is$typed = _is$typed,
  validate = _validate
const id = 'ar.cabildoabierto.feed.defs'

/** a feed is always a list of feedViewContents */
export interface FeedViewContent {
  $type?: 'ar.cabildoabierto.feed.defs#feedViewContent'
  content: $Typed<PostView> | $Typed<ArticleView> | { $type: string }
  reply?: AppBskyFeedDefs.ReplyRef
  reason?:
    | $Typed<AppBskyFeedDefs.ReasonRepost>
    | $Typed<AppBskyFeedDefs.ReasonPin>
    | { $type: string }
  /** Context provided by feed generator that may be passed back alongside interactions. */
  feedContext?: string
}

const hashFeedViewContent = 'feedViewContent'

export function isFeedViewContent<V>(v: V) {
  return is$typed(v, id, hashFeedViewContent)
}

export function validateFeedViewContent<V>(v: V) {
  return validate<FeedViewContent & V>(v, id, hashFeedViewContent)
}

export interface ThreadViewContent {
  $type?: 'ar.cabildoabierto.feed.defs#threadViewContent'
  content:
    | $Typed<AppBskyFeedDefs.PostView>
    | $Typed<ArticleView>
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
  threadContext?: AppBskyFeedDefs.ThreadContext
}

const hashThreadViewContent = 'threadViewContent'

export function isThreadViewContent<V>(v: V) {
  return is$typed(v, id, hashThreadViewContent)
}

export function validateThreadViewContent<V>(v: V) {
  return validate<ThreadViewContent & V>(v, id, hashThreadViewContent)
}

export interface PostView {
  $type?: 'ar.cabildoabierto.feed.defs#postView'
  uri: string
  cid: string
  author: AppBskyActorDefs.ProfileViewBasic
  record: { [_ in string]: unknown }
  embed?:
    | $Typed<AppBskyEmbedImages.View>
    | $Typed<AppBskyEmbedVideo.View>
    | $Typed<AppBskyEmbedExternal.View>
    | $Typed<AppBskyEmbedRecord.View>
    | $Typed<AppBskyEmbedRecordWithMedia.View>
    | $Typed<ArCabildoabiertoEmbedSelectionQuote.Main>
    | { $type: string }
  uniqueViewsCount?: number
  bskyRepostCount?: number
  bskyLikeCount?: number
  bskyQuoteCount?: number
  replyCount?: number
  repostCount?: number
  likeCount?: number
  quoteCount?: number
  indexedAt: string
  viewer?: AppBskyFeedDefs.ViewerState
  labels?: ComAtprotoLabelDefs.Label[]
  threadgate?: AppBskyFeedDefs.ThreadgateView
}

const hashPostView = 'postView'

export function isPostView<V>(v: V) {
  return is$typed(v, id, hashPostView)
}

export function validatePostView<V>(v: V) {
  return validate<PostView & V>(v, id, hashPostView)
}

export interface ArticleView {
  $type?: 'ar.cabildoabierto.feed.defs#articleView'
  uri: string
  cid: string
  author: AppBskyActorDefs.ProfileViewBasic
  /** A plain text summary of the article. */
  summary?: string
  record: { [_ in string]: unknown }
  uniqueViewsCount?: number
  bskyRepostCount?: number
  bskyLikeCount?: number
  bskyQuoteCount?: number
  replyCount?: number
  repostCount?: number
  likeCount?: number
  quoteCount?: number
  indexedAt: string
  viewer?: AppBskyFeedDefs.ViewerState
  labels?: ComAtprotoLabelDefs.Label[]
  threadgate?: AppBskyFeedDefs.ThreadgateView
}

const hashArticleView = 'articleView'

export function isArticleView<V>(v: V) {
  return is$typed(v, id, hashArticleView)
}

export function validateArticleView<V>(v: V) {
  return validate<ArticleView & V>(v, id, hashArticleView)
}
