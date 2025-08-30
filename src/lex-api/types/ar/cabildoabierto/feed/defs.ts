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
import type * as AppBskyFeedDefs from '../../../app/bsky/feed/defs'
import type * as ArCabildoabiertoWikiTopicVersion from '../wiki/topicVersion'
import type * as ArCabildoabiertoDataDataset from '../data/dataset'
import type * as ArCabildoabiertoActorDefs from '../actor/defs'
import type * as AppBskyEmbedImages from '../../../app/bsky/embed/images'
import type * as AppBskyEmbedVideo from '../../../app/bsky/embed/video'
import type * as AppBskyEmbedExternal from '../../../app/bsky/embed/external'
import type * as AppBskyEmbedRecord from '../../../app/bsky/embed/record'
import type * as AppBskyEmbedRecordWithMedia from '../../../app/bsky/embed/recordWithMedia'
import type * as ArCabildoabiertoEmbedSelectionQuote from '../embed/selectionQuote'
import type * as ArCabildoabiertoEmbedVisualization from '../embed/visualization'
import type * as ComAtprotoLabelDefs from '../../../com/atproto/label/defs'
import type * as ArCabildoabiertoFeedArticle from './article'

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
    | $Typed<PostView>
    | $Typed<ArticleView>
    | $Typed<FullArticleView>
    | $Typed<ArCabildoabiertoWikiTopicVersion.TopicViewBasic>
    | $Typed<ArCabildoabiertoDataDataset.DatasetView>
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
  author: ArCabildoabiertoActorDefs.ProfileViewBasic
  record: { [_ in string]: unknown }
  embed?:
    | $Typed<AppBskyEmbedImages.View>
    | $Typed<AppBskyEmbedVideo.View>
    | $Typed<AppBskyEmbedExternal.View>
    | $Typed<AppBskyEmbedRecord.View>
    | $Typed<AppBskyEmbedRecordWithMedia.View>
    | $Typed<ArCabildoabiertoEmbedSelectionQuote.View>
    | $Typed<ArCabildoabiertoEmbedVisualization.View>
    | { $type: string }
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
  rootCreationDate?: string
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
  title: string
  author: ArCabildoabiertoActorDefs.ProfileViewBasic
  /** A summary of the article to be shown in the feed. */
  summary: string
  summaryFormat?: string
  record: { [_ in string]: unknown }
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

export interface FullArticleView {
  $type?: 'ar.cabildoabierto.feed.defs#fullArticleView'
  uri: string
  cid: string
  author: ArCabildoabiertoActorDefs.ProfileViewBasic
  title: string
  /** The full article text */
  text: string
  format?: string
  /** A summary of the article to be shown in the feed. */
  summary: string
  summaryFormat?: string
  record: { [_ in string]: unknown }
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
  topicsMentioned?: TopicMention[]
  threadgate?: AppBskyFeedDefs.ThreadgateView
  embeds?: ArCabildoabiertoFeedArticle.ArticleEmbedView[]
}

const hashFullArticleView = 'fullArticleView'

export function isFullArticleView<V>(v: V) {
  return is$typed(v, id, hashFullArticleView)
}

export function validateFullArticleView<V>(v: V) {
  return validate<FullArticleView & V>(v, id, hashFullArticleView)
}

export interface TopicMention {
  $type?: 'ar.cabildoabierto.feed.defs#topicMention'
  title: string
  id: string
  count: number
}

const hashTopicMention = 'topicMention'

export function isTopicMention<V>(v: V) {
  return is$typed(v, id, hashTopicMention)
}

export function validateTopicMention<V>(v: V) {
  return validate<TopicMention & V>(v, id, hashTopicMention)
}
