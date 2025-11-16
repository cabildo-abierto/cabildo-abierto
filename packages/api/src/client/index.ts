/**
 * GENERATED CODE - DO NOT MODIFY
 */
import {
  XrpcClient,
  type FetchHandler,
  type FetchHandlerOptions,
} from '@atproto/xrpc'
import { schemas } from './lexicons.js'
import { CID } from 'multiformats/cid'
import { type OmitKey, type Un$Typed } from './util.js'
import * as AppBskyActorDefs from './types/app/bsky/actor/defs.js'
import * as AppBskyEmbedDefs from './types/app/bsky/embed/defs.js'
import * as AppBskyEmbedExternal from './types/app/bsky/embed/external.js'
import * as AppBskyEmbedImages from './types/app/bsky/embed/images.js'
import * as AppBskyEmbedRecord from './types/app/bsky/embed/record.js'
import * as AppBskyEmbedRecordWithMedia from './types/app/bsky/embed/recordWithMedia.js'
import * as AppBskyEmbedVideo from './types/app/bsky/embed/video.js'
import * as AppBskyFeedDefs from './types/app/bsky/feed/defs.js'
import * as AppBskyFeedPost from './types/app/bsky/feed/post.js'
import * as AppBskyGraphDefs from './types/app/bsky/graph/defs.js'
import * as AppBskyLabelerDefs from './types/app/bsky/labeler/defs.js'
import * as AppBskyRichtextFacet from './types/app/bsky/richtext/facet.js'
import * as ArCabildoabiertoActorCaProfile from './types/ar/cabildoabierto/actor/caProfile.js'
import * as ArCabildoabiertoActorDefs from './types/ar/cabildoabierto/actor/defs.js'
import * as ArCabildoabiertoDataDataset from './types/ar/cabildoabierto/data/dataset.js'
import * as ArCabildoabiertoEmbedRecord from './types/ar/cabildoabierto/embed/record.js'
import * as ArCabildoabiertoEmbedRecordWithMedia from './types/ar/cabildoabierto/embed/recordWithMedia.js'
import * as ArCabildoabiertoEmbedSelectionQuote from './types/ar/cabildoabierto/embed/selectionQuote.js'
import * as ArCabildoabiertoEmbedVisualization from './types/ar/cabildoabierto/embed/visualization.js'
import * as ArCabildoabiertoFeedArticle from './types/ar/cabildoabierto/feed/article.js'
import * as ArCabildoabiertoFeedDefs from './types/ar/cabildoabierto/feed/defs.js'
import * as ArCabildoabiertoNotificationGetUnreadCount from './types/ar/cabildoabierto/notification/getUnreadCount.js'
import * as ArCabildoabiertoNotificationListNotifications from './types/ar/cabildoabierto/notification/listNotifications.js'
import * as ArCabildoabiertoNotificationUpdateSeen from './types/ar/cabildoabierto/notification/updateSeen.js'
import * as ArCabildoabiertoWikiDefs from './types/ar/cabildoabierto/wiki/defs.js'
import * as ArCabildoabiertoWikiTopicVersion from './types/ar/cabildoabierto/wiki/topicVersion.js'
import * as ArCabildoabiertoWikiVoteAccept from './types/ar/cabildoabierto/wiki/voteAccept.js'
import * as ArCabildoabiertoWikiVoteReject from './types/ar/cabildoabierto/wiki/voteReject.js'
import * as ComAtprotoLabelDefs from './types/com/atproto/label/defs.js'
import * as ComAtprotoRepoCreateRecord from './types/com/atproto/repo/createRecord.js'
import * as ComAtprotoRepoDefs from './types/com/atproto/repo/defs.js'
import * as ComAtprotoRepoDeleteRecord from './types/com/atproto/repo/deleteRecord.js'
import * as ComAtprotoRepoGetRecord from './types/com/atproto/repo/getRecord.js'
import * as ComAtprotoRepoListRecords from './types/com/atproto/repo/listRecords.js'
import * as ComAtprotoRepoPutRecord from './types/com/atproto/repo/putRecord.js'
import * as ComAtprotoRepoStrongRef from './types/com/atproto/repo/strongRef.js'

export * as AppBskyActorDefs from './types/app/bsky/actor/defs.js'
export * as AppBskyEmbedDefs from './types/app/bsky/embed/defs.js'
export * as AppBskyEmbedExternal from './types/app/bsky/embed/external.js'
export * as AppBskyEmbedImages from './types/app/bsky/embed/images.js'
export * as AppBskyEmbedRecord from './types/app/bsky/embed/record.js'
export * as AppBskyEmbedRecordWithMedia from './types/app/bsky/embed/recordWithMedia.js'
export * as AppBskyEmbedVideo from './types/app/bsky/embed/video.js'
export * as AppBskyFeedDefs from './types/app/bsky/feed/defs.js'
export * as AppBskyFeedPost from './types/app/bsky/feed/post.js'
export * as AppBskyGraphDefs from './types/app/bsky/graph/defs.js'
export * as AppBskyLabelerDefs from './types/app/bsky/labeler/defs.js'
export * as AppBskyRichtextFacet from './types/app/bsky/richtext/facet.js'
export * as ArCabildoabiertoActorCaProfile from './types/ar/cabildoabierto/actor/caProfile.js'
export * as ArCabildoabiertoActorDefs from './types/ar/cabildoabierto/actor/defs.js'
export * as ArCabildoabiertoDataDataset from './types/ar/cabildoabierto/data/dataset.js'
export * as ArCabildoabiertoEmbedRecord from './types/ar/cabildoabierto/embed/record.js'
export * as ArCabildoabiertoEmbedRecordWithMedia from './types/ar/cabildoabierto/embed/recordWithMedia.js'
export * as ArCabildoabiertoEmbedSelectionQuote from './types/ar/cabildoabierto/embed/selectionQuote.js'
export * as ArCabildoabiertoEmbedVisualization from './types/ar/cabildoabierto/embed/visualization.js'
export * as ArCabildoabiertoFeedArticle from './types/ar/cabildoabierto/feed/article.js'
export * as ArCabildoabiertoFeedDefs from './types/ar/cabildoabierto/feed/defs.js'
export * as ArCabildoabiertoNotificationGetUnreadCount from './types/ar/cabildoabierto/notification/getUnreadCount.js'
export * as ArCabildoabiertoNotificationListNotifications from './types/ar/cabildoabierto/notification/listNotifications.js'
export * as ArCabildoabiertoNotificationUpdateSeen from './types/ar/cabildoabierto/notification/updateSeen.js'
export * as ArCabildoabiertoWikiDefs from './types/ar/cabildoabierto/wiki/defs.js'
export * as ArCabildoabiertoWikiTopicVersion from './types/ar/cabildoabierto/wiki/topicVersion.js'
export * as ArCabildoabiertoWikiVoteAccept from './types/ar/cabildoabierto/wiki/voteAccept.js'
export * as ArCabildoabiertoWikiVoteReject from './types/ar/cabildoabierto/wiki/voteReject.js'
export * as ComAtprotoLabelDefs from './types/com/atproto/label/defs.js'
export * as ComAtprotoRepoCreateRecord from './types/com/atproto/repo/createRecord.js'
export * as ComAtprotoRepoDefs from './types/com/atproto/repo/defs.js'
export * as ComAtprotoRepoDeleteRecord from './types/com/atproto/repo/deleteRecord.js'
export * as ComAtprotoRepoGetRecord from './types/com/atproto/repo/getRecord.js'
export * as ComAtprotoRepoListRecords from './types/com/atproto/repo/listRecords.js'
export * as ComAtprotoRepoPutRecord from './types/com/atproto/repo/putRecord.js'
export * as ComAtprotoRepoStrongRef from './types/com/atproto/repo/strongRef.js'

export const APP_BSKY_FEED = {
  DefsRequestLess: 'app.bsky.feed.defs#requestLess',
  DefsRequestMore: 'app.bsky.feed.defs#requestMore',
  DefsClickthroughItem: 'app.bsky.feed.defs#clickthroughItem',
  DefsClickthroughAuthor: 'app.bsky.feed.defs#clickthroughAuthor',
  DefsClickthroughReposter: 'app.bsky.feed.defs#clickthroughReposter',
  DefsClickthroughEmbed: 'app.bsky.feed.defs#clickthroughEmbed',
  DefsContentModeUnspecified: 'app.bsky.feed.defs#contentModeUnspecified',
  DefsContentModeVideo: 'app.bsky.feed.defs#contentModeVideo',
  DefsInteractionSeen: 'app.bsky.feed.defs#interactionSeen',
  DefsInteractionLike: 'app.bsky.feed.defs#interactionLike',
  DefsInteractionRepost: 'app.bsky.feed.defs#interactionRepost',
  DefsInteractionReply: 'app.bsky.feed.defs#interactionReply',
  DefsInteractionQuote: 'app.bsky.feed.defs#interactionQuote',
  DefsInteractionShare: 'app.bsky.feed.defs#interactionShare',
}
export const APP_BSKY_GRAPH = {
  DefsModlist: 'app.bsky.graph.defs#modlist',
  DefsCuratelist: 'app.bsky.graph.defs#curatelist',
  DefsReferencelist: 'app.bsky.graph.defs#referencelist',
}

export class AtpBaseClient extends XrpcClient {
  app: AppNS
  ar: ArNS
  com: ComNS

  constructor(options: FetchHandler | FetchHandlerOptions) {
    super(options, schemas)
    this.app = new AppNS(this)
    this.ar = new ArNS(this)
    this.com = new ComNS(this)
  }

  /** @deprecated use `this` instead */
  get xrpc(): XrpcClient {
    return this
  }
}

export class AppNS {
  _client: XrpcClient
  bsky: AppBskyNS

  constructor(client: XrpcClient) {
    this._client = client
    this.bsky = new AppBskyNS(client)
  }
}

export class AppBskyNS {
  _client: XrpcClient
  embed: AppBskyEmbedNS
  feed: AppBskyFeedNS
  richtext: AppBskyRichtextNS

  constructor(client: XrpcClient) {
    this._client = client
    this.embed = new AppBskyEmbedNS(client)
    this.feed = new AppBskyFeedNS(client)
    this.richtext = new AppBskyRichtextNS(client)
  }
}

export class AppBskyEmbedNS {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }
}

export class AppBskyFeedNS {
  _client: XrpcClient
  post: AppBskyFeedPostRecord

  constructor(client: XrpcClient) {
    this._client = client
    this.post = new AppBskyFeedPostRecord(client)
  }
}

export class AppBskyFeedPostRecord {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }

  async list(
    params: OmitKey<ComAtprotoRepoListRecords.QueryParams, 'collection'>,
  ): Promise<{
    cursor?: string
    records: { uri: string; value: AppBskyFeedPost.Record }[]
  }> {
    const res = await this._client.call('com.atproto.repo.listRecords', {
      collection: 'app.bsky.feed.post',
      ...params,
    })
    return res.data
  }

  async get(
    params: OmitKey<ComAtprotoRepoGetRecord.QueryParams, 'collection'>,
  ): Promise<{ uri: string; cid: string; value: AppBskyFeedPost.Record }> {
    const res = await this._client.call('com.atproto.repo.getRecord', {
      collection: 'app.bsky.feed.post',
      ...params,
    })
    return res.data
  }

  async create(
    params: OmitKey<
      ComAtprotoRepoCreateRecord.InputSchema,
      'collection' | 'record'
    >,
    record: Un$Typed<AppBskyFeedPost.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = 'app.bsky.feed.post'
    const res = await this._client.call(
      'com.atproto.repo.createRecord',
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: 'application/json', headers },
    )
    return res.data
  }

  async put(
    params: OmitKey<
      ComAtprotoRepoPutRecord.InputSchema,
      'collection' | 'record'
    >,
    record: Un$Typed<AppBskyFeedPost.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = 'app.bsky.feed.post'
    const res = await this._client.call(
      'com.atproto.repo.putRecord',
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: 'application/json', headers },
    )
    return res.data
  }

  async delete(
    params: OmitKey<ComAtprotoRepoDeleteRecord.InputSchema, 'collection'>,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._client.call(
      'com.atproto.repo.deleteRecord',
      undefined,
      { collection: 'app.bsky.feed.post', ...params },
      { headers },
    )
  }
}

export class AppBskyRichtextNS {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }
}

export class ArNS {
  _client: XrpcClient
  cabildoabierto: ArCabildoabiertoNS

  constructor(client: XrpcClient) {
    this._client = client
    this.cabildoabierto = new ArCabildoabiertoNS(client)
  }
}

export class ArCabildoabiertoNS {
  _client: XrpcClient
  actor: ArCabildoabiertoActorNS
  data: ArCabildoabiertoDataNS
  embed: ArCabildoabiertoEmbedNS
  feed: ArCabildoabiertoFeedNS
  notification: ArCabildoabiertoNotificationNS
  wiki: ArCabildoabiertoWikiNS

  constructor(client: XrpcClient) {
    this._client = client
    this.actor = new ArCabildoabiertoActorNS(client)
    this.data = new ArCabildoabiertoDataNS(client)
    this.embed = new ArCabildoabiertoEmbedNS(client)
    this.feed = new ArCabildoabiertoFeedNS(client)
    this.notification = new ArCabildoabiertoNotificationNS(client)
    this.wiki = new ArCabildoabiertoWikiNS(client)
  }
}

export class ArCabildoabiertoActorNS {
  _client: XrpcClient
  caProfile: ArCabildoabiertoActorCaProfileRecord

  constructor(client: XrpcClient) {
    this._client = client
    this.caProfile = new ArCabildoabiertoActorCaProfileRecord(client)
  }
}

export class ArCabildoabiertoActorCaProfileRecord {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }

  async list(
    params: OmitKey<ComAtprotoRepoListRecords.QueryParams, 'collection'>,
  ): Promise<{
    cursor?: string
    records: { uri: string; value: ArCabildoabiertoActorCaProfile.Record }[]
  }> {
    const res = await this._client.call('com.atproto.repo.listRecords', {
      collection: 'ar.cabildoabierto.actor.caProfile',
      ...params,
    })
    return res.data
  }

  async get(
    params: OmitKey<ComAtprotoRepoGetRecord.QueryParams, 'collection'>,
  ): Promise<{
    uri: string
    cid: string
    value: ArCabildoabiertoActorCaProfile.Record
  }> {
    const res = await this._client.call('com.atproto.repo.getRecord', {
      collection: 'ar.cabildoabierto.actor.caProfile',
      ...params,
    })
    return res.data
  }

  async create(
    params: OmitKey<
      ComAtprotoRepoCreateRecord.InputSchema,
      'collection' | 'record'
    >,
    record: Un$Typed<ArCabildoabiertoActorCaProfile.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = 'ar.cabildoabierto.actor.caProfile'
    const res = await this._client.call(
      'com.atproto.repo.createRecord',
      undefined,
      {
        collection,
        rkey: 'self',
        ...params,
        record: { ...record, $type: collection },
      },
      { encoding: 'application/json', headers },
    )
    return res.data
  }

  async put(
    params: OmitKey<
      ComAtprotoRepoPutRecord.InputSchema,
      'collection' | 'record'
    >,
    record: Un$Typed<ArCabildoabiertoActorCaProfile.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = 'ar.cabildoabierto.actor.caProfile'
    const res = await this._client.call(
      'com.atproto.repo.putRecord',
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: 'application/json', headers },
    )
    return res.data
  }

  async delete(
    params: OmitKey<ComAtprotoRepoDeleteRecord.InputSchema, 'collection'>,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._client.call(
      'com.atproto.repo.deleteRecord',
      undefined,
      { collection: 'ar.cabildoabierto.actor.caProfile', ...params },
      { headers },
    )
  }
}

export class ArCabildoabiertoDataNS {
  _client: XrpcClient
  dataset: ArCabildoabiertoDataDatasetRecord

  constructor(client: XrpcClient) {
    this._client = client
    this.dataset = new ArCabildoabiertoDataDatasetRecord(client)
  }
}

export class ArCabildoabiertoDataDatasetRecord {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }

  async list(
    params: OmitKey<ComAtprotoRepoListRecords.QueryParams, 'collection'>,
  ): Promise<{
    cursor?: string
    records: { uri: string; value: ArCabildoabiertoDataDataset.Record }[]
  }> {
    const res = await this._client.call('com.atproto.repo.listRecords', {
      collection: 'ar.cabildoabierto.data.dataset',
      ...params,
    })
    return res.data
  }

  async get(
    params: OmitKey<ComAtprotoRepoGetRecord.QueryParams, 'collection'>,
  ): Promise<{
    uri: string
    cid: string
    value: ArCabildoabiertoDataDataset.Record
  }> {
    const res = await this._client.call('com.atproto.repo.getRecord', {
      collection: 'ar.cabildoabierto.data.dataset',
      ...params,
    })
    return res.data
  }

  async create(
    params: OmitKey<
      ComAtprotoRepoCreateRecord.InputSchema,
      'collection' | 'record'
    >,
    record: Un$Typed<ArCabildoabiertoDataDataset.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = 'ar.cabildoabierto.data.dataset'
    const res = await this._client.call(
      'com.atproto.repo.createRecord',
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: 'application/json', headers },
    )
    return res.data
  }

  async put(
    params: OmitKey<
      ComAtprotoRepoPutRecord.InputSchema,
      'collection' | 'record'
    >,
    record: Un$Typed<ArCabildoabiertoDataDataset.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = 'ar.cabildoabierto.data.dataset'
    const res = await this._client.call(
      'com.atproto.repo.putRecord',
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: 'application/json', headers },
    )
    return res.data
  }

  async delete(
    params: OmitKey<ComAtprotoRepoDeleteRecord.InputSchema, 'collection'>,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._client.call(
      'com.atproto.repo.deleteRecord',
      undefined,
      { collection: 'ar.cabildoabierto.data.dataset', ...params },
      { headers },
    )
  }
}

export class ArCabildoabiertoEmbedNS {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }
}

export class ArCabildoabiertoFeedNS {
  _client: XrpcClient
  article: ArCabildoabiertoFeedArticleRecord

  constructor(client: XrpcClient) {
    this._client = client
    this.article = new ArCabildoabiertoFeedArticleRecord(client)
  }
}

export class ArCabildoabiertoFeedArticleRecord {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }

  async list(
    params: OmitKey<ComAtprotoRepoListRecords.QueryParams, 'collection'>,
  ): Promise<{
    cursor?: string
    records: { uri: string; value: ArCabildoabiertoFeedArticle.Record }[]
  }> {
    const res = await this._client.call('com.atproto.repo.listRecords', {
      collection: 'ar.cabildoabierto.feed.article',
      ...params,
    })
    return res.data
  }

  async get(
    params: OmitKey<ComAtprotoRepoGetRecord.QueryParams, 'collection'>,
  ): Promise<{
    uri: string
    cid: string
    value: ArCabildoabiertoFeedArticle.Record
  }> {
    const res = await this._client.call('com.atproto.repo.getRecord', {
      collection: 'ar.cabildoabierto.feed.article',
      ...params,
    })
    return res.data
  }

  async create(
    params: OmitKey<
      ComAtprotoRepoCreateRecord.InputSchema,
      'collection' | 'record'
    >,
    record: Un$Typed<ArCabildoabiertoFeedArticle.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = 'ar.cabildoabierto.feed.article'
    const res = await this._client.call(
      'com.atproto.repo.createRecord',
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: 'application/json', headers },
    )
    return res.data
  }

  async put(
    params: OmitKey<
      ComAtprotoRepoPutRecord.InputSchema,
      'collection' | 'record'
    >,
    record: Un$Typed<ArCabildoabiertoFeedArticle.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = 'ar.cabildoabierto.feed.article'
    const res = await this._client.call(
      'com.atproto.repo.putRecord',
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: 'application/json', headers },
    )
    return res.data
  }

  async delete(
    params: OmitKey<ComAtprotoRepoDeleteRecord.InputSchema, 'collection'>,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._client.call(
      'com.atproto.repo.deleteRecord',
      undefined,
      { collection: 'ar.cabildoabierto.feed.article', ...params },
      { headers },
    )
  }
}

export class ArCabildoabiertoNotificationNS {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }

  getUnreadCount(
    params?: ArCabildoabiertoNotificationGetUnreadCount.QueryParams,
    opts?: ArCabildoabiertoNotificationGetUnreadCount.CallOptions,
  ): Promise<ArCabildoabiertoNotificationGetUnreadCount.Response> {
    return this._client.call(
      'ar.cabildoabierto.notification.getUnreadCount',
      params,
      undefined,
      opts,
    )
  }

  listNotifications(
    params?: ArCabildoabiertoNotificationListNotifications.QueryParams,
    opts?: ArCabildoabiertoNotificationListNotifications.CallOptions,
  ): Promise<ArCabildoabiertoNotificationListNotifications.Response> {
    return this._client.call(
      'ar.cabildoabierto.notification.listNotifications',
      params,
      undefined,
      opts,
    )
  }

  updateSeen(
    data?: ArCabildoabiertoNotificationUpdateSeen.InputSchema,
    opts?: ArCabildoabiertoNotificationUpdateSeen.CallOptions,
  ): Promise<ArCabildoabiertoNotificationUpdateSeen.Response> {
    return this._client.call(
      'ar.cabildoabierto.notification.updateSeen',
      opts?.qp,
      data,
      opts,
    )
  }
}

export class ArCabildoabiertoWikiNS {
  _client: XrpcClient
  topicVersion: ArCabildoabiertoWikiTopicVersionRecord
  voteAccept: ArCabildoabiertoWikiVoteAcceptRecord
  voteReject: ArCabildoabiertoWikiVoteRejectRecord

  constructor(client: XrpcClient) {
    this._client = client
    this.topicVersion = new ArCabildoabiertoWikiTopicVersionRecord(client)
    this.voteAccept = new ArCabildoabiertoWikiVoteAcceptRecord(client)
    this.voteReject = new ArCabildoabiertoWikiVoteRejectRecord(client)
  }
}

export class ArCabildoabiertoWikiTopicVersionRecord {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }

  async list(
    params: OmitKey<ComAtprotoRepoListRecords.QueryParams, 'collection'>,
  ): Promise<{
    cursor?: string
    records: { uri: string; value: ArCabildoabiertoWikiTopicVersion.Record }[]
  }> {
    const res = await this._client.call('com.atproto.repo.listRecords', {
      collection: 'ar.cabildoabierto.wiki.topicVersion',
      ...params,
    })
    return res.data
  }

  async get(
    params: OmitKey<ComAtprotoRepoGetRecord.QueryParams, 'collection'>,
  ): Promise<{
    uri: string
    cid: string
    value: ArCabildoabiertoWikiTopicVersion.Record
  }> {
    const res = await this._client.call('com.atproto.repo.getRecord', {
      collection: 'ar.cabildoabierto.wiki.topicVersion',
      ...params,
    })
    return res.data
  }

  async create(
    params: OmitKey<
      ComAtprotoRepoCreateRecord.InputSchema,
      'collection' | 'record'
    >,
    record: Un$Typed<ArCabildoabiertoWikiTopicVersion.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = 'ar.cabildoabierto.wiki.topicVersion'
    const res = await this._client.call(
      'com.atproto.repo.createRecord',
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: 'application/json', headers },
    )
    return res.data
  }

  async put(
    params: OmitKey<
      ComAtprotoRepoPutRecord.InputSchema,
      'collection' | 'record'
    >,
    record: Un$Typed<ArCabildoabiertoWikiTopicVersion.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = 'ar.cabildoabierto.wiki.topicVersion'
    const res = await this._client.call(
      'com.atproto.repo.putRecord',
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: 'application/json', headers },
    )
    return res.data
  }

  async delete(
    params: OmitKey<ComAtprotoRepoDeleteRecord.InputSchema, 'collection'>,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._client.call(
      'com.atproto.repo.deleteRecord',
      undefined,
      { collection: 'ar.cabildoabierto.wiki.topicVersion', ...params },
      { headers },
    )
  }
}

export class ArCabildoabiertoWikiVoteAcceptRecord {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }

  async list(
    params: OmitKey<ComAtprotoRepoListRecords.QueryParams, 'collection'>,
  ): Promise<{
    cursor?: string
    records: { uri: string; value: ArCabildoabiertoWikiVoteAccept.Record }[]
  }> {
    const res = await this._client.call('com.atproto.repo.listRecords', {
      collection: 'ar.cabildoabierto.wiki.voteAccept',
      ...params,
    })
    return res.data
  }

  async get(
    params: OmitKey<ComAtprotoRepoGetRecord.QueryParams, 'collection'>,
  ): Promise<{
    uri: string
    cid: string
    value: ArCabildoabiertoWikiVoteAccept.Record
  }> {
    const res = await this._client.call('com.atproto.repo.getRecord', {
      collection: 'ar.cabildoabierto.wiki.voteAccept',
      ...params,
    })
    return res.data
  }

  async create(
    params: OmitKey<
      ComAtprotoRepoCreateRecord.InputSchema,
      'collection' | 'record'
    >,
    record: Un$Typed<ArCabildoabiertoWikiVoteAccept.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = 'ar.cabildoabierto.wiki.voteAccept'
    const res = await this._client.call(
      'com.atproto.repo.createRecord',
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: 'application/json', headers },
    )
    return res.data
  }

  async put(
    params: OmitKey<
      ComAtprotoRepoPutRecord.InputSchema,
      'collection' | 'record'
    >,
    record: Un$Typed<ArCabildoabiertoWikiVoteAccept.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = 'ar.cabildoabierto.wiki.voteAccept'
    const res = await this._client.call(
      'com.atproto.repo.putRecord',
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: 'application/json', headers },
    )
    return res.data
  }

  async delete(
    params: OmitKey<ComAtprotoRepoDeleteRecord.InputSchema, 'collection'>,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._client.call(
      'com.atproto.repo.deleteRecord',
      undefined,
      { collection: 'ar.cabildoabierto.wiki.voteAccept', ...params },
      { headers },
    )
  }
}

export class ArCabildoabiertoWikiVoteRejectRecord {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }

  async list(
    params: OmitKey<ComAtprotoRepoListRecords.QueryParams, 'collection'>,
  ): Promise<{
    cursor?: string
    records: { uri: string; value: ArCabildoabiertoWikiVoteReject.Record }[]
  }> {
    const res = await this._client.call('com.atproto.repo.listRecords', {
      collection: 'ar.cabildoabierto.wiki.voteReject',
      ...params,
    })
    return res.data
  }

  async get(
    params: OmitKey<ComAtprotoRepoGetRecord.QueryParams, 'collection'>,
  ): Promise<{
    uri: string
    cid: string
    value: ArCabildoabiertoWikiVoteReject.Record
  }> {
    const res = await this._client.call('com.atproto.repo.getRecord', {
      collection: 'ar.cabildoabierto.wiki.voteReject',
      ...params,
    })
    return res.data
  }

  async create(
    params: OmitKey<
      ComAtprotoRepoCreateRecord.InputSchema,
      'collection' | 'record'
    >,
    record: Un$Typed<ArCabildoabiertoWikiVoteReject.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = 'ar.cabildoabierto.wiki.voteReject'
    const res = await this._client.call(
      'com.atproto.repo.createRecord',
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: 'application/json', headers },
    )
    return res.data
  }

  async put(
    params: OmitKey<
      ComAtprotoRepoPutRecord.InputSchema,
      'collection' | 'record'
    >,
    record: Un$Typed<ArCabildoabiertoWikiVoteReject.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = 'ar.cabildoabierto.wiki.voteReject'
    const res = await this._client.call(
      'com.atproto.repo.putRecord',
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: 'application/json', headers },
    )
    return res.data
  }

  async delete(
    params: OmitKey<ComAtprotoRepoDeleteRecord.InputSchema, 'collection'>,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._client.call(
      'com.atproto.repo.deleteRecord',
      undefined,
      { collection: 'ar.cabildoabierto.wiki.voteReject', ...params },
      { headers },
    )
  }
}

export class ComNS {
  _client: XrpcClient
  atproto: ComAtprotoNS

  constructor(client: XrpcClient) {
    this._client = client
    this.atproto = new ComAtprotoNS(client)
  }
}

export class ComAtprotoNS {
  _client: XrpcClient
  repo: ComAtprotoRepoNS

  constructor(client: XrpcClient) {
    this._client = client
    this.repo = new ComAtprotoRepoNS(client)
  }
}

export class ComAtprotoRepoNS {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }

  createRecord(
    data?: ComAtprotoRepoCreateRecord.InputSchema,
    opts?: ComAtprotoRepoCreateRecord.CallOptions,
  ): Promise<ComAtprotoRepoCreateRecord.Response> {
    return this._client
      .call('com.atproto.repo.createRecord', opts?.qp, data, opts)
      .catch((e) => {
        throw ComAtprotoRepoCreateRecord.toKnownErr(e)
      })
  }

  deleteRecord(
    data?: ComAtprotoRepoDeleteRecord.InputSchema,
    opts?: ComAtprotoRepoDeleteRecord.CallOptions,
  ): Promise<ComAtprotoRepoDeleteRecord.Response> {
    return this._client
      .call('com.atproto.repo.deleteRecord', opts?.qp, data, opts)
      .catch((e) => {
        throw ComAtprotoRepoDeleteRecord.toKnownErr(e)
      })
  }

  getRecord(
    params?: ComAtprotoRepoGetRecord.QueryParams,
    opts?: ComAtprotoRepoGetRecord.CallOptions,
  ): Promise<ComAtprotoRepoGetRecord.Response> {
    return this._client
      .call('com.atproto.repo.getRecord', params, undefined, opts)
      .catch((e) => {
        throw ComAtprotoRepoGetRecord.toKnownErr(e)
      })
  }

  listRecords(
    params?: ComAtprotoRepoListRecords.QueryParams,
    opts?: ComAtprotoRepoListRecords.CallOptions,
  ): Promise<ComAtprotoRepoListRecords.Response> {
    return this._client.call(
      'com.atproto.repo.listRecords',
      params,
      undefined,
      opts,
    )
  }

  putRecord(
    data?: ComAtprotoRepoPutRecord.InputSchema,
    opts?: ComAtprotoRepoPutRecord.CallOptions,
  ): Promise<ComAtprotoRepoPutRecord.Response> {
    return this._client
      .call('com.atproto.repo.putRecord', opts?.qp, data, opts)
      .catch((e) => {
        throw ComAtprotoRepoPutRecord.toKnownErr(e)
      })
  }
}
