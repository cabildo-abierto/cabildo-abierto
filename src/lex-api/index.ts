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
import * as ArCabildoabiertoActorCaProfile from './types/ar/cabildoabierto/actor/caProfile.js'
import * as ArCabildoabiertoDataDataBlock from './types/ar/cabildoabierto/data/dataBlock.js'
import * as ArCabildoabiertoDataDataset from './types/ar/cabildoabierto/data/dataset.js'
import * as ArCabildoabiertoDataVisualization from './types/ar/cabildoabierto/data/visualization.js'
import * as ArCabildoabiertoEmbedSelectionQuote from './types/ar/cabildoabierto/embed/selectionQuote.js'
import * as ArCabildoabiertoFeedArticle from './types/ar/cabildoabierto/feed/article.js'
import * as ArCabildoabiertoFeedDefs from './types/ar/cabildoabierto/feed/defs.js'
import * as ArCabildoabiertoFeedGetFeed from './types/ar/cabildoabierto/feed/getFeed.js'
import * as ArCabildoabiertoWikiTopicVersion from './types/ar/cabildoabierto/wiki/topicVersion.js'
import * as ArCabildoabiertoWikiVote from './types/ar/cabildoabierto/wiki/vote.js'
import * as ComAtprotoRepoApplyWrites from './types/com/atproto/repo/applyWrites.js'
import * as ComAtprotoRepoCreateRecord from './types/com/atproto/repo/createRecord.js'
import * as ComAtprotoRepoDefs from './types/com/atproto/repo/defs.js'
import * as ComAtprotoRepoDeleteRecord from './types/com/atproto/repo/deleteRecord.js'
import * as ComAtprotoRepoDescribeRepo from './types/com/atproto/repo/describeRepo.js'
import * as ComAtprotoRepoGetRecord from './types/com/atproto/repo/getRecord.js'
import * as ComAtprotoRepoImportRepo from './types/com/atproto/repo/importRepo.js'
import * as ComAtprotoRepoListMissingBlobs from './types/com/atproto/repo/listMissingBlobs.js'
import * as ComAtprotoRepoListRecords from './types/com/atproto/repo/listRecords.js'
import * as ComAtprotoRepoPutRecord from './types/com/atproto/repo/putRecord.js'
import * as ComAtprotoRepoStrongRef from './types/com/atproto/repo/strongRef.js'
import * as ComAtprotoRepoUploadBlob from './types/com/atproto/repo/uploadBlob.js'
import * as ComAtprotoIdentityDefs from './types/com/atproto/identity/defs.js'
import * as ComAtprotoIdentityGetRecommendedDidCredentials from './types/com/atproto/identity/getRecommendedDidCredentials.js'
import * as ComAtprotoIdentityRefreshIdentity from './types/com/atproto/identity/refreshIdentity.js'
import * as ComAtprotoIdentityRequestPlcOperationSignature from './types/com/atproto/identity/requestPlcOperationSignature.js'
import * as ComAtprotoIdentityResolveDid from './types/com/atproto/identity/resolveDid.js'
import * as ComAtprotoIdentityResolveHandle from './types/com/atproto/identity/resolveHandle.js'
import * as ComAtprotoIdentityResolveIdentity from './types/com/atproto/identity/resolveIdentity.js'
import * as ComAtprotoIdentitySignPlcOperation from './types/com/atproto/identity/signPlcOperation.js'
import * as ComAtprotoIdentitySubmitPlcOperation from './types/com/atproto/identity/submitPlcOperation.js'
import * as ComAtprotoIdentityUpdateHandle from './types/com/atproto/identity/updateHandle.js'
import * as ComAtprotoLabelDefs from './types/com/atproto/label/defs.js'
import * as ComAtprotoLabelQueryLabels from './types/com/atproto/label/queryLabels.js'
import * as ComAtprotoLabelSubscribeLabels from './types/com/atproto/label/subscribeLabels.js'
import * as ComAtprotoServerActivateAccount from './types/com/atproto/server/activateAccount.js'
import * as ComAtprotoServerCheckAccountStatus from './types/com/atproto/server/checkAccountStatus.js'
import * as ComAtprotoServerConfirmEmail from './types/com/atproto/server/confirmEmail.js'
import * as ComAtprotoServerCreateAccount from './types/com/atproto/server/createAccount.js'
import * as ComAtprotoServerCreateAppPassword from './types/com/atproto/server/createAppPassword.js'
import * as ComAtprotoServerCreateInviteCode from './types/com/atproto/server/createInviteCode.js'
import * as ComAtprotoServerCreateInviteCodes from './types/com/atproto/server/createInviteCodes.js'
import * as ComAtprotoServerCreateSession from './types/com/atproto/server/createSession.js'
import * as ComAtprotoServerDeactivateAccount from './types/com/atproto/server/deactivateAccount.js'
import * as ComAtprotoServerDefs from './types/com/atproto/server/defs.js'
import * as ComAtprotoServerDeleteAccount from './types/com/atproto/server/deleteAccount.js'
import * as ComAtprotoServerDeleteSession from './types/com/atproto/server/deleteSession.js'
import * as ComAtprotoServerDescribeServer from './types/com/atproto/server/describeServer.js'
import * as ComAtprotoServerGetAccountInviteCodes from './types/com/atproto/server/getAccountInviteCodes.js'
import * as ComAtprotoServerGetServiceAuth from './types/com/atproto/server/getServiceAuth.js'
import * as ComAtprotoServerGetSession from './types/com/atproto/server/getSession.js'
import * as ComAtprotoServerListAppPasswords from './types/com/atproto/server/listAppPasswords.js'
import * as ComAtprotoServerRefreshSession from './types/com/atproto/server/refreshSession.js'
import * as ComAtprotoServerRequestAccountDelete from './types/com/atproto/server/requestAccountDelete.js'
import * as ComAtprotoServerRequestEmailConfirmation from './types/com/atproto/server/requestEmailConfirmation.js'
import * as ComAtprotoServerRequestEmailUpdate from './types/com/atproto/server/requestEmailUpdate.js'
import * as ComAtprotoServerRequestPasswordReset from './types/com/atproto/server/requestPasswordReset.js'
import * as ComAtprotoServerReserveSigningKey from './types/com/atproto/server/reserveSigningKey.js'
import * as ComAtprotoServerResetPassword from './types/com/atproto/server/resetPassword.js'
import * as ComAtprotoServerRevokeAppPassword from './types/com/atproto/server/revokeAppPassword.js'
import * as ComAtprotoServerUpdateEmail from './types/com/atproto/server/updateEmail.js'
import * as ComAtprotoModerationCreateReport from './types/com/atproto/moderation/createReport.js'
import * as ComAtprotoModerationDefs from './types/com/atproto/moderation/defs.js'
import * as AppBskyFeedDefs from './types/app/bsky/feed/defs.js'
import * as AppBskyFeedDescribeFeedGenerator from './types/app/bsky/feed/describeFeedGenerator.js'
import * as AppBskyFeedGenerator from './types/app/bsky/feed/generator.js'
import * as AppBskyFeedGetActorFeeds from './types/app/bsky/feed/getActorFeeds.js'
import * as AppBskyFeedGetActorLikes from './types/app/bsky/feed/getActorLikes.js'
import * as AppBskyFeedGetAuthorFeed from './types/app/bsky/feed/getAuthorFeed.js'
import * as AppBskyFeedGetFeedGenerator from './types/app/bsky/feed/getFeedGenerator.js'
import * as AppBskyFeedGetFeedGenerators from './types/app/bsky/feed/getFeedGenerators.js'
import * as AppBskyFeedGetFeed from './types/app/bsky/feed/getFeed.js'
import * as AppBskyFeedGetFeedSkeleton from './types/app/bsky/feed/getFeedSkeleton.js'
import * as AppBskyFeedGetLikes from './types/app/bsky/feed/getLikes.js'
import * as AppBskyFeedGetListFeed from './types/app/bsky/feed/getListFeed.js'
import * as AppBskyFeedGetPosts from './types/app/bsky/feed/getPosts.js'
import * as AppBskyFeedGetPostThread from './types/app/bsky/feed/getPostThread.js'
import * as AppBskyFeedGetQuotes from './types/app/bsky/feed/getQuotes.js'
import * as AppBskyFeedGetRepostedBy from './types/app/bsky/feed/getRepostedBy.js'
import * as AppBskyFeedGetSuggestedFeeds from './types/app/bsky/feed/getSuggestedFeeds.js'
import * as AppBskyFeedGetTimeline from './types/app/bsky/feed/getTimeline.js'
import * as AppBskyFeedLike from './types/app/bsky/feed/like.js'
import * as AppBskyFeedPostgate from './types/app/bsky/feed/postgate.js'
import * as AppBskyFeedPost from './types/app/bsky/feed/post.js'
import * as AppBskyFeedRepost from './types/app/bsky/feed/repost.js'
import * as AppBskyFeedSearchPosts from './types/app/bsky/feed/searchPosts.js'
import * as AppBskyFeedSendInteractions from './types/app/bsky/feed/sendInteractions.js'
import * as AppBskyFeedThreadgate from './types/app/bsky/feed/threadgate.js'
import * as AppBskyEmbedDefs from './types/app/bsky/embed/defs.js'
import * as AppBskyEmbedExternal from './types/app/bsky/embed/external.js'
import * as AppBskyEmbedImages from './types/app/bsky/embed/images.js'
import * as AppBskyEmbedRecord from './types/app/bsky/embed/record.js'
import * as AppBskyEmbedRecordWithMedia from './types/app/bsky/embed/recordWithMedia.js'
import * as AppBskyEmbedVideo from './types/app/bsky/embed/video.js'
import * as AppBskyGraphBlock from './types/app/bsky/graph/block.js'
import * as AppBskyGraphDefs from './types/app/bsky/graph/defs.js'
import * as AppBskyGraphFollow from './types/app/bsky/graph/follow.js'
import * as AppBskyGraphGetActorStarterPacks from './types/app/bsky/graph/getActorStarterPacks.js'
import * as AppBskyGraphGetBlocks from './types/app/bsky/graph/getBlocks.js'
import * as AppBskyGraphGetFollowers from './types/app/bsky/graph/getFollowers.js'
import * as AppBskyGraphGetFollows from './types/app/bsky/graph/getFollows.js'
import * as AppBskyGraphGetKnownFollowers from './types/app/bsky/graph/getKnownFollowers.js'
import * as AppBskyGraphGetListBlocks from './types/app/bsky/graph/getListBlocks.js'
import * as AppBskyGraphGetList from './types/app/bsky/graph/getList.js'
import * as AppBskyGraphGetListMutes from './types/app/bsky/graph/getListMutes.js'
import * as AppBskyGraphGetLists from './types/app/bsky/graph/getLists.js'
import * as AppBskyGraphGetMutes from './types/app/bsky/graph/getMutes.js'
import * as AppBskyGraphGetRelationships from './types/app/bsky/graph/getRelationships.js'
import * as AppBskyGraphGetStarterPack from './types/app/bsky/graph/getStarterPack.js'
import * as AppBskyGraphGetStarterPacks from './types/app/bsky/graph/getStarterPacks.js'
import * as AppBskyGraphGetSuggestedFollowsByActor from './types/app/bsky/graph/getSuggestedFollowsByActor.js'
import * as AppBskyGraphListblock from './types/app/bsky/graph/listblock.js'
import * as AppBskyGraphListitem from './types/app/bsky/graph/listitem.js'
import * as AppBskyGraphList from './types/app/bsky/graph/list.js'
import * as AppBskyGraphMuteActor from './types/app/bsky/graph/muteActor.js'
import * as AppBskyGraphMuteActorList from './types/app/bsky/graph/muteActorList.js'
import * as AppBskyGraphMuteThread from './types/app/bsky/graph/muteThread.js'
import * as AppBskyGraphSearchStarterPacks from './types/app/bsky/graph/searchStarterPacks.js'
import * as AppBskyGraphStarterpack from './types/app/bsky/graph/starterpack.js'
import * as AppBskyGraphUnmuteActor from './types/app/bsky/graph/unmuteActor.js'
import * as AppBskyGraphUnmuteActorList from './types/app/bsky/graph/unmuteActorList.js'
import * as AppBskyGraphUnmuteThread from './types/app/bsky/graph/unmuteThread.js'
import * as AppBskyLabelerDefs from './types/app/bsky/labeler/defs.js'
import * as AppBskyLabelerGetServices from './types/app/bsky/labeler/getServices.js'
import * as AppBskyLabelerService from './types/app/bsky/labeler/service.js'
import * as AppBskyNotificationGetUnreadCount from './types/app/bsky/notification/getUnreadCount.js'
import * as AppBskyNotificationListNotifications from './types/app/bsky/notification/listNotifications.js'
import * as AppBskyNotificationPutPreferences from './types/app/bsky/notification/putPreferences.js'
import * as AppBskyNotificationRegisterPush from './types/app/bsky/notification/registerPush.js'
import * as AppBskyNotificationUpdateSeen from './types/app/bsky/notification/updateSeen.js'
import * as AppBskyUnspeccedDefs from './types/app/bsky/unspecced/defs.js'
import * as AppBskyUnspeccedGetConfig from './types/app/bsky/unspecced/getConfig.js'
import * as AppBskyUnspeccedGetPopularFeedGenerators from './types/app/bsky/unspecced/getPopularFeedGenerators.js'
import * as AppBskyUnspeccedGetSuggestionsSkeleton from './types/app/bsky/unspecced/getSuggestionsSkeleton.js'
import * as AppBskyUnspeccedGetTaggedSuggestions from './types/app/bsky/unspecced/getTaggedSuggestions.js'
import * as AppBskyUnspeccedGetTrendingTopics from './types/app/bsky/unspecced/getTrendingTopics.js'
import * as AppBskyUnspeccedSearchActorsSkeleton from './types/app/bsky/unspecced/searchActorsSkeleton.js'
import * as AppBskyUnspeccedSearchPostsSkeleton from './types/app/bsky/unspecced/searchPostsSkeleton.js'
import * as AppBskyUnspeccedSearchStarterPacksSkeleton from './types/app/bsky/unspecced/searchStarterPacksSkeleton.js'
import * as AppBskyVideoDefs from './types/app/bsky/video/defs.js'
import * as AppBskyVideoGetJobStatus from './types/app/bsky/video/getJobStatus.js'
import * as AppBskyVideoGetUploadLimits from './types/app/bsky/video/getUploadLimits.js'
import * as AppBskyVideoUploadVideo from './types/app/bsky/video/uploadVideo.js'
import * as AppBskyActorDefs from './types/app/bsky/actor/defs.js'
import * as AppBskyActorGetPreferences from './types/app/bsky/actor/getPreferences.js'
import * as AppBskyActorGetProfile from './types/app/bsky/actor/getProfile.js'
import * as AppBskyActorGetProfiles from './types/app/bsky/actor/getProfiles.js'
import * as AppBskyActorGetSuggestions from './types/app/bsky/actor/getSuggestions.js'
import * as AppBskyActorProfile from './types/app/bsky/actor/profile.js'
import * as AppBskyActorPutPreferences from './types/app/bsky/actor/putPreferences.js'
import * as AppBskyActorSearchActors from './types/app/bsky/actor/searchActors.js'
import * as AppBskyActorSearchActorsTypeahead from './types/app/bsky/actor/searchActorsTypeahead.js'
import * as AppBskyRichtextFacet from './types/app/bsky/richtext/facet.js'

export * as ArCabildoabiertoActorCaProfile from './types/ar/cabildoabierto/actor/caProfile.js'
export * as ArCabildoabiertoDataDataBlock from './types/ar/cabildoabierto/data/dataBlock.js'
export * as ArCabildoabiertoDataDataset from './types/ar/cabildoabierto/data/dataset.js'
export * as ArCabildoabiertoDataVisualization from './types/ar/cabildoabierto/data/visualization.js'
export * as ArCabildoabiertoEmbedSelectionQuote from './types/ar/cabildoabierto/embed/selectionQuote.js'
export * as ArCabildoabiertoFeedArticle from './types/ar/cabildoabierto/feed/article.js'
export * as ArCabildoabiertoFeedDefs from './types/ar/cabildoabierto/feed/defs.js'
export * as ArCabildoabiertoFeedGetFeed from './types/ar/cabildoabierto/feed/getFeed.js'
export * as ArCabildoabiertoWikiTopicVersion from './types/ar/cabildoabierto/wiki/topicVersion.js'
export * as ArCabildoabiertoWikiVote from './types/ar/cabildoabierto/wiki/vote.js'
export * as ComAtprotoRepoApplyWrites from './types/com/atproto/repo/applyWrites.js'
export * as ComAtprotoRepoCreateRecord from './types/com/atproto/repo/createRecord.js'
export * as ComAtprotoRepoDefs from './types/com/atproto/repo/defs.js'
export * as ComAtprotoRepoDeleteRecord from './types/com/atproto/repo/deleteRecord.js'
export * as ComAtprotoRepoDescribeRepo from './types/com/atproto/repo/describeRepo.js'
export * as ComAtprotoRepoGetRecord from './types/com/atproto/repo/getRecord.js'
export * as ComAtprotoRepoImportRepo from './types/com/atproto/repo/importRepo.js'
export * as ComAtprotoRepoListMissingBlobs from './types/com/atproto/repo/listMissingBlobs.js'
export * as ComAtprotoRepoListRecords from './types/com/atproto/repo/listRecords.js'
export * as ComAtprotoRepoPutRecord from './types/com/atproto/repo/putRecord.js'
export * as ComAtprotoRepoStrongRef from './types/com/atproto/repo/strongRef.js'
export * as ComAtprotoRepoUploadBlob from './types/com/atproto/repo/uploadBlob.js'
export * as ComAtprotoIdentityDefs from './types/com/atproto/identity/defs.js'
export * as ComAtprotoIdentityGetRecommendedDidCredentials from './types/com/atproto/identity/getRecommendedDidCredentials.js'
export * as ComAtprotoIdentityRefreshIdentity from './types/com/atproto/identity/refreshIdentity.js'
export * as ComAtprotoIdentityRequestPlcOperationSignature from './types/com/atproto/identity/requestPlcOperationSignature.js'
export * as ComAtprotoIdentityResolveDid from './types/com/atproto/identity/resolveDid.js'
export * as ComAtprotoIdentityResolveHandle from './types/com/atproto/identity/resolveHandle.js'
export * as ComAtprotoIdentityResolveIdentity from './types/com/atproto/identity/resolveIdentity.js'
export * as ComAtprotoIdentitySignPlcOperation from './types/com/atproto/identity/signPlcOperation.js'
export * as ComAtprotoIdentitySubmitPlcOperation from './types/com/atproto/identity/submitPlcOperation.js'
export * as ComAtprotoIdentityUpdateHandle from './types/com/atproto/identity/updateHandle.js'
export * as ComAtprotoLabelDefs from './types/com/atproto/label/defs.js'
export * as ComAtprotoLabelQueryLabels from './types/com/atproto/label/queryLabels.js'
export * as ComAtprotoLabelSubscribeLabels from './types/com/atproto/label/subscribeLabels.js'
export * as ComAtprotoServerActivateAccount from './types/com/atproto/server/activateAccount.js'
export * as ComAtprotoServerCheckAccountStatus from './types/com/atproto/server/checkAccountStatus.js'
export * as ComAtprotoServerConfirmEmail from './types/com/atproto/server/confirmEmail.js'
export * as ComAtprotoServerCreateAccount from './types/com/atproto/server/createAccount.js'
export * as ComAtprotoServerCreateAppPassword from './types/com/atproto/server/createAppPassword.js'
export * as ComAtprotoServerCreateInviteCode from './types/com/atproto/server/createInviteCode.js'
export * as ComAtprotoServerCreateInviteCodes from './types/com/atproto/server/createInviteCodes.js'
export * as ComAtprotoServerCreateSession from './types/com/atproto/server/createSession.js'
export * as ComAtprotoServerDeactivateAccount from './types/com/atproto/server/deactivateAccount.js'
export * as ComAtprotoServerDefs from './types/com/atproto/server/defs.js'
export * as ComAtprotoServerDeleteAccount from './types/com/atproto/server/deleteAccount.js'
export * as ComAtprotoServerDeleteSession from './types/com/atproto/server/deleteSession.js'
export * as ComAtprotoServerDescribeServer from './types/com/atproto/server/describeServer.js'
export * as ComAtprotoServerGetAccountInviteCodes from './types/com/atproto/server/getAccountInviteCodes.js'
export * as ComAtprotoServerGetServiceAuth from './types/com/atproto/server/getServiceAuth.js'
export * as ComAtprotoServerGetSession from './types/com/atproto/server/getSession.js'
export * as ComAtprotoServerListAppPasswords from './types/com/atproto/server/listAppPasswords.js'
export * as ComAtprotoServerRefreshSession from './types/com/atproto/server/refreshSession.js'
export * as ComAtprotoServerRequestAccountDelete from './types/com/atproto/server/requestAccountDelete.js'
export * as ComAtprotoServerRequestEmailConfirmation from './types/com/atproto/server/requestEmailConfirmation.js'
export * as ComAtprotoServerRequestEmailUpdate from './types/com/atproto/server/requestEmailUpdate.js'
export * as ComAtprotoServerRequestPasswordReset from './types/com/atproto/server/requestPasswordReset.js'
export * as ComAtprotoServerReserveSigningKey from './types/com/atproto/server/reserveSigningKey.js'
export * as ComAtprotoServerResetPassword from './types/com/atproto/server/resetPassword.js'
export * as ComAtprotoServerRevokeAppPassword from './types/com/atproto/server/revokeAppPassword.js'
export * as ComAtprotoServerUpdateEmail from './types/com/atproto/server/updateEmail.js'
export * as ComAtprotoModerationCreateReport from './types/com/atproto/moderation/createReport.js'
export * as ComAtprotoModerationDefs from './types/com/atproto/moderation/defs.js'
export * as AppBskyFeedDefs from './types/app/bsky/feed/defs.js'
export * as AppBskyFeedDescribeFeedGenerator from './types/app/bsky/feed/describeFeedGenerator.js'
export * as AppBskyFeedGenerator from './types/app/bsky/feed/generator.js'
export * as AppBskyFeedGetActorFeeds from './types/app/bsky/feed/getActorFeeds.js'
export * as AppBskyFeedGetActorLikes from './types/app/bsky/feed/getActorLikes.js'
export * as AppBskyFeedGetAuthorFeed from './types/app/bsky/feed/getAuthorFeed.js'
export * as AppBskyFeedGetFeedGenerator from './types/app/bsky/feed/getFeedGenerator.js'
export * as AppBskyFeedGetFeedGenerators from './types/app/bsky/feed/getFeedGenerators.js'
export * as AppBskyFeedGetFeed from './types/app/bsky/feed/getFeed.js'
export * as AppBskyFeedGetFeedSkeleton from './types/app/bsky/feed/getFeedSkeleton.js'
export * as AppBskyFeedGetLikes from './types/app/bsky/feed/getLikes.js'
export * as AppBskyFeedGetListFeed from './types/app/bsky/feed/getListFeed.js'
export * as AppBskyFeedGetPosts from './types/app/bsky/feed/getPosts.js'
export * as AppBskyFeedGetPostThread from './types/app/bsky/feed/getPostThread.js'
export * as AppBskyFeedGetQuotes from './types/app/bsky/feed/getQuotes.js'
export * as AppBskyFeedGetRepostedBy from './types/app/bsky/feed/getRepostedBy.js'
export * as AppBskyFeedGetSuggestedFeeds from './types/app/bsky/feed/getSuggestedFeeds.js'
export * as AppBskyFeedGetTimeline from './types/app/bsky/feed/getTimeline.js'
export * as AppBskyFeedLike from './types/app/bsky/feed/like.js'
export * as AppBskyFeedPostgate from './types/app/bsky/feed/postgate.js'
export * as AppBskyFeedPost from './types/app/bsky/feed/post.js'
export * as AppBskyFeedRepost from './types/app/bsky/feed/repost.js'
export * as AppBskyFeedSearchPosts from './types/app/bsky/feed/searchPosts.js'
export * as AppBskyFeedSendInteractions from './types/app/bsky/feed/sendInteractions.js'
export * as AppBskyFeedThreadgate from './types/app/bsky/feed/threadgate.js'
export * as AppBskyEmbedDefs from './types/app/bsky/embed/defs.js'
export * as AppBskyEmbedExternal from './types/app/bsky/embed/external.js'
export * as AppBskyEmbedImages from './types/app/bsky/embed/images.js'
export * as AppBskyEmbedRecord from './types/app/bsky/embed/record.js'
export * as AppBskyEmbedRecordWithMedia from './types/app/bsky/embed/recordWithMedia.js'
export * as AppBskyEmbedVideo from './types/app/bsky/embed/video.js'
export * as AppBskyGraphBlock from './types/app/bsky/graph/block.js'
export * as AppBskyGraphDefs from './types/app/bsky/graph/defs.js'
export * as AppBskyGraphFollow from './types/app/bsky/graph/follow.js'
export * as AppBskyGraphGetActorStarterPacks from './types/app/bsky/graph/getActorStarterPacks.js'
export * as AppBskyGraphGetBlocks from './types/app/bsky/graph/getBlocks.js'
export * as AppBskyGraphGetFollowers from './types/app/bsky/graph/getFollowers.js'
export * as AppBskyGraphGetFollows from './types/app/bsky/graph/getFollows.js'
export * as AppBskyGraphGetKnownFollowers from './types/app/bsky/graph/getKnownFollowers.js'
export * as AppBskyGraphGetListBlocks from './types/app/bsky/graph/getListBlocks.js'
export * as AppBskyGraphGetList from './types/app/bsky/graph/getList.js'
export * as AppBskyGraphGetListMutes from './types/app/bsky/graph/getListMutes.js'
export * as AppBskyGraphGetLists from './types/app/bsky/graph/getLists.js'
export * as AppBskyGraphGetMutes from './types/app/bsky/graph/getMutes.js'
export * as AppBskyGraphGetRelationships from './types/app/bsky/graph/getRelationships.js'
export * as AppBskyGraphGetStarterPack from './types/app/bsky/graph/getStarterPack.js'
export * as AppBskyGraphGetStarterPacks from './types/app/bsky/graph/getStarterPacks.js'
export * as AppBskyGraphGetSuggestedFollowsByActor from './types/app/bsky/graph/getSuggestedFollowsByActor.js'
export * as AppBskyGraphListblock from './types/app/bsky/graph/listblock.js'
export * as AppBskyGraphListitem from './types/app/bsky/graph/listitem.js'
export * as AppBskyGraphList from './types/app/bsky/graph/list.js'
export * as AppBskyGraphMuteActor from './types/app/bsky/graph/muteActor.js'
export * as AppBskyGraphMuteActorList from './types/app/bsky/graph/muteActorList.js'
export * as AppBskyGraphMuteThread from './types/app/bsky/graph/muteThread.js'
export * as AppBskyGraphSearchStarterPacks from './types/app/bsky/graph/searchStarterPacks.js'
export * as AppBskyGraphStarterpack from './types/app/bsky/graph/starterpack.js'
export * as AppBskyGraphUnmuteActor from './types/app/bsky/graph/unmuteActor.js'
export * as AppBskyGraphUnmuteActorList from './types/app/bsky/graph/unmuteActorList.js'
export * as AppBskyGraphUnmuteThread from './types/app/bsky/graph/unmuteThread.js'
export * as AppBskyLabelerDefs from './types/app/bsky/labeler/defs.js'
export * as AppBskyLabelerGetServices from './types/app/bsky/labeler/getServices.js'
export * as AppBskyLabelerService from './types/app/bsky/labeler/service.js'
export * as AppBskyNotificationGetUnreadCount from './types/app/bsky/notification/getUnreadCount.js'
export * as AppBskyNotificationListNotifications from './types/app/bsky/notification/listNotifications.js'
export * as AppBskyNotificationPutPreferences from './types/app/bsky/notification/putPreferences.js'
export * as AppBskyNotificationRegisterPush from './types/app/bsky/notification/registerPush.js'
export * as AppBskyNotificationUpdateSeen from './types/app/bsky/notification/updateSeen.js'
export * as AppBskyUnspeccedDefs from './types/app/bsky/unspecced/defs.js'
export * as AppBskyUnspeccedGetConfig from './types/app/bsky/unspecced/getConfig.js'
export * as AppBskyUnspeccedGetPopularFeedGenerators from './types/app/bsky/unspecced/getPopularFeedGenerators.js'
export * as AppBskyUnspeccedGetSuggestionsSkeleton from './types/app/bsky/unspecced/getSuggestionsSkeleton.js'
export * as AppBskyUnspeccedGetTaggedSuggestions from './types/app/bsky/unspecced/getTaggedSuggestions.js'
export * as AppBskyUnspeccedGetTrendingTopics from './types/app/bsky/unspecced/getTrendingTopics.js'
export * as AppBskyUnspeccedSearchActorsSkeleton from './types/app/bsky/unspecced/searchActorsSkeleton.js'
export * as AppBskyUnspeccedSearchPostsSkeleton from './types/app/bsky/unspecced/searchPostsSkeleton.js'
export * as AppBskyUnspeccedSearchStarterPacksSkeleton from './types/app/bsky/unspecced/searchStarterPacksSkeleton.js'
export * as AppBskyVideoDefs from './types/app/bsky/video/defs.js'
export * as AppBskyVideoGetJobStatus from './types/app/bsky/video/getJobStatus.js'
export * as AppBskyVideoGetUploadLimits from './types/app/bsky/video/getUploadLimits.js'
export * as AppBskyVideoUploadVideo from './types/app/bsky/video/uploadVideo.js'
export * as AppBskyActorDefs from './types/app/bsky/actor/defs.js'
export * as AppBskyActorGetPreferences from './types/app/bsky/actor/getPreferences.js'
export * as AppBskyActorGetProfile from './types/app/bsky/actor/getProfile.js'
export * as AppBskyActorGetProfiles from './types/app/bsky/actor/getProfiles.js'
export * as AppBskyActorGetSuggestions from './types/app/bsky/actor/getSuggestions.js'
export * as AppBskyActorProfile from './types/app/bsky/actor/profile.js'
export * as AppBskyActorPutPreferences from './types/app/bsky/actor/putPreferences.js'
export * as AppBskyActorSearchActors from './types/app/bsky/actor/searchActors.js'
export * as AppBskyActorSearchActorsTypeahead from './types/app/bsky/actor/searchActorsTypeahead.js'
export * as AppBskyRichtextFacet from './types/app/bsky/richtext/facet.js'

export const COM_ATPROTO_MODERATION = {
  DefsReasonSpam: 'com.atproto.moderation.defs#reasonSpam',
  DefsReasonViolation: 'com.atproto.moderation.defs#reasonViolation',
  DefsReasonMisleading: 'com.atproto.moderation.defs#reasonMisleading',
  DefsReasonSexual: 'com.atproto.moderation.defs#reasonSexual',
  DefsReasonRude: 'com.atproto.moderation.defs#reasonRude',
  DefsReasonOther: 'com.atproto.moderation.defs#reasonOther',
  DefsReasonAppeal: 'com.atproto.moderation.defs#reasonAppeal',
}
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
  ar: ArNS
  com: ComNS
  app: AppNS

  constructor(options: FetchHandler | FetchHandlerOptions) {
    super(options, schemas)
    this.ar = new ArNS(this)
    this.com = new ComNS(this)
    this.app = new AppNS(this)
  }

  /** @deprecated use `this` instead */
  get xrpc(): XrpcClient {
    return this
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
  wiki: ArCabildoabiertoWikiNS

  constructor(client: XrpcClient) {
    this._client = client
    this.actor = new ArCabildoabiertoActorNS(client)
    this.data = new ArCabildoabiertoDataNS(client)
    this.embed = new ArCabildoabiertoEmbedNS(client)
    this.feed = new ArCabildoabiertoFeedNS(client)
    this.wiki = new ArCabildoabiertoWikiNS(client)
  }
}

export class ArCabildoabiertoActorNS {
  _client: XrpcClient
  caProfile: CaProfileRecord

  constructor(client: XrpcClient) {
    this._client = client
    this.caProfile = new CaProfileRecord(client)
  }
}

export class CaProfileRecord {
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
  dataBlock: DataBlockRecord
  dataset: DatasetRecord
  visualization: VisualizationRecord

  constructor(client: XrpcClient) {
    this._client = client
    this.dataBlock = new DataBlockRecord(client)
    this.dataset = new DatasetRecord(client)
    this.visualization = new VisualizationRecord(client)
  }
}

export class DataBlockRecord {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }

  async list(
    params: OmitKey<ComAtprotoRepoListRecords.QueryParams, 'collection'>,
  ): Promise<{
    cursor?: string
    records: { uri: string; value: ArCabildoabiertoDataDataBlock.Record }[]
  }> {
    const res = await this._client.call('com.atproto.repo.listRecords', {
      collection: 'ar.cabildoabierto.data.dataBlock',
      ...params,
    })
    return res.data
  }

  async get(
    params: OmitKey<ComAtprotoRepoGetRecord.QueryParams, 'collection'>,
  ): Promise<{
    uri: string
    cid: string
    value: ArCabildoabiertoDataDataBlock.Record
  }> {
    const res = await this._client.call('com.atproto.repo.getRecord', {
      collection: 'ar.cabildoabierto.data.dataBlock',
      ...params,
    })
    return res.data
  }

  async create(
    params: OmitKey<
      ComAtprotoRepoCreateRecord.InputSchema,
      'collection' | 'record'
    >,
    record: Un$Typed<ArCabildoabiertoDataDataBlock.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = 'ar.cabildoabierto.data.dataBlock'
    const res = await this._client.call(
      'com.atproto.repo.createRecord',
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
      { collection: 'ar.cabildoabierto.data.dataBlock', ...params },
      { headers },
    )
  }
}

export class DatasetRecord {
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

export class VisualizationRecord {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }

  async list(
    params: OmitKey<ComAtprotoRepoListRecords.QueryParams, 'collection'>,
  ): Promise<{
    cursor?: string
    records: { uri: string; value: ArCabildoabiertoDataVisualization.Record }[]
  }> {
    const res = await this._client.call('com.atproto.repo.listRecords', {
      collection: 'ar.cabildoabierto.data.visualization',
      ...params,
    })
    return res.data
  }

  async get(
    params: OmitKey<ComAtprotoRepoGetRecord.QueryParams, 'collection'>,
  ): Promise<{
    uri: string
    cid: string
    value: ArCabildoabiertoDataVisualization.Record
  }> {
    const res = await this._client.call('com.atproto.repo.getRecord', {
      collection: 'ar.cabildoabierto.data.visualization',
      ...params,
    })
    return res.data
  }

  async create(
    params: OmitKey<
      ComAtprotoRepoCreateRecord.InputSchema,
      'collection' | 'record'
    >,
    record: Un$Typed<ArCabildoabiertoDataVisualization.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = 'ar.cabildoabierto.data.visualization'
    const res = await this._client.call(
      'com.atproto.repo.createRecord',
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
      { collection: 'ar.cabildoabierto.data.visualization', ...params },
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
  article: ArticleRecord

  constructor(client: XrpcClient) {
    this._client = client
    this.article = new ArticleRecord(client)
  }

  getFeed(
    params?: ArCabildoabiertoFeedGetFeed.QueryParams,
    opts?: ArCabildoabiertoFeedGetFeed.CallOptions,
  ): Promise<ArCabildoabiertoFeedGetFeed.Response> {
    return this._client
      .call('ar.cabildoabierto.feed.getFeed', params, undefined, opts)
      .catch((e) => {
        throw ArCabildoabiertoFeedGetFeed.toKnownErr(e)
      })
  }
}

export class ArticleRecord {
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

export class ArCabildoabiertoWikiNS {
  _client: XrpcClient
  topicVersion: TopicVersionRecord
  vote: VoteRecord

  constructor(client: XrpcClient) {
    this._client = client
    this.topicVersion = new TopicVersionRecord(client)
    this.vote = new VoteRecord(client)
  }
}

export class TopicVersionRecord {
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

export class VoteRecord {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }

  async list(
    params: OmitKey<ComAtprotoRepoListRecords.QueryParams, 'collection'>,
  ): Promise<{
    cursor?: string
    records: { uri: string; value: ArCabildoabiertoWikiVote.Record }[]
  }> {
    const res = await this._client.call('com.atproto.repo.listRecords', {
      collection: 'ar.cabildoabierto.wiki.vote',
      ...params,
    })
    return res.data
  }

  async get(
    params: OmitKey<ComAtprotoRepoGetRecord.QueryParams, 'collection'>,
  ): Promise<{
    uri: string
    cid: string
    value: ArCabildoabiertoWikiVote.Record
  }> {
    const res = await this._client.call('com.atproto.repo.getRecord', {
      collection: 'ar.cabildoabierto.wiki.vote',
      ...params,
    })
    return res.data
  }

  async create(
    params: OmitKey<
      ComAtprotoRepoCreateRecord.InputSchema,
      'collection' | 'record'
    >,
    record: Un$Typed<ArCabildoabiertoWikiVote.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = 'ar.cabildoabierto.wiki.vote'
    const res = await this._client.call(
      'com.atproto.repo.createRecord',
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
      { collection: 'ar.cabildoabierto.wiki.vote', ...params },
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
  identity: ComAtprotoIdentityNS
  label: ComAtprotoLabelNS
  server: ComAtprotoServerNS
  moderation: ComAtprotoModerationNS

  constructor(client: XrpcClient) {
    this._client = client
    this.repo = new ComAtprotoRepoNS(client)
    this.identity = new ComAtprotoIdentityNS(client)
    this.label = new ComAtprotoLabelNS(client)
    this.server = new ComAtprotoServerNS(client)
    this.moderation = new ComAtprotoModerationNS(client)
  }
}

export class ComAtprotoRepoNS {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }

  applyWrites(
    data?: ComAtprotoRepoApplyWrites.InputSchema,
    opts?: ComAtprotoRepoApplyWrites.CallOptions,
  ): Promise<ComAtprotoRepoApplyWrites.Response> {
    return this._client
      .call('com.atproto.repo.applyWrites', opts?.qp, data, opts)
      .catch((e) => {
        throw ComAtprotoRepoApplyWrites.toKnownErr(e)
      })
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

  describeRepo(
    params?: ComAtprotoRepoDescribeRepo.QueryParams,
    opts?: ComAtprotoRepoDescribeRepo.CallOptions,
  ): Promise<ComAtprotoRepoDescribeRepo.Response> {
    return this._client.call(
      'com.atproto.repo.describeRepo',
      params,
      undefined,
      opts,
    )
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

  importRepo(
    data?: ComAtprotoRepoImportRepo.InputSchema,
    opts?: ComAtprotoRepoImportRepo.CallOptions,
  ): Promise<ComAtprotoRepoImportRepo.Response> {
    return this._client.call(
      'com.atproto.repo.importRepo',
      opts?.qp,
      data,
      opts,
    )
  }

  listMissingBlobs(
    params?: ComAtprotoRepoListMissingBlobs.QueryParams,
    opts?: ComAtprotoRepoListMissingBlobs.CallOptions,
  ): Promise<ComAtprotoRepoListMissingBlobs.Response> {
    return this._client.call(
      'com.atproto.repo.listMissingBlobs',
      params,
      undefined,
      opts,
    )
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

  uploadBlob(
    data?: ComAtprotoRepoUploadBlob.InputSchema,
    opts?: ComAtprotoRepoUploadBlob.CallOptions,
  ): Promise<ComAtprotoRepoUploadBlob.Response> {
    return this._client.call(
      'com.atproto.repo.uploadBlob',
      opts?.qp,
      data,
      opts,
    )
  }
}

export class ComAtprotoIdentityNS {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }

  getRecommendedDidCredentials(
    params?: ComAtprotoIdentityGetRecommendedDidCredentials.QueryParams,
    opts?: ComAtprotoIdentityGetRecommendedDidCredentials.CallOptions,
  ): Promise<ComAtprotoIdentityGetRecommendedDidCredentials.Response> {
    return this._client.call(
      'com.atproto.identity.getRecommendedDidCredentials',
      params,
      undefined,
      opts,
    )
  }

  refreshIdentity(
    data?: ComAtprotoIdentityRefreshIdentity.InputSchema,
    opts?: ComAtprotoIdentityRefreshIdentity.CallOptions,
  ): Promise<ComAtprotoIdentityRefreshIdentity.Response> {
    return this._client
      .call('com.atproto.identity.refreshIdentity', opts?.qp, data, opts)
      .catch((e) => {
        throw ComAtprotoIdentityRefreshIdentity.toKnownErr(e)
      })
  }

  requestPlcOperationSignature(
    data?: ComAtprotoIdentityRequestPlcOperationSignature.InputSchema,
    opts?: ComAtprotoIdentityRequestPlcOperationSignature.CallOptions,
  ): Promise<ComAtprotoIdentityRequestPlcOperationSignature.Response> {
    return this._client.call(
      'com.atproto.identity.requestPlcOperationSignature',
      opts?.qp,
      data,
      opts,
    )
  }

  resolveDid(
    params?: ComAtprotoIdentityResolveDid.QueryParams,
    opts?: ComAtprotoIdentityResolveDid.CallOptions,
  ): Promise<ComAtprotoIdentityResolveDid.Response> {
    return this._client
      .call('com.atproto.identity.resolveDid', params, undefined, opts)
      .catch((e) => {
        throw ComAtprotoIdentityResolveDid.toKnownErr(e)
      })
  }

  resolveHandle(
    params?: ComAtprotoIdentityResolveHandle.QueryParams,
    opts?: ComAtprotoIdentityResolveHandle.CallOptions,
  ): Promise<ComAtprotoIdentityResolveHandle.Response> {
    return this._client
      .call('com.atproto.identity.resolveHandle', params, undefined, opts)
      .catch((e) => {
        throw ComAtprotoIdentityResolveHandle.toKnownErr(e)
      })
  }

  resolveIdentity(
    params?: ComAtprotoIdentityResolveIdentity.QueryParams,
    opts?: ComAtprotoIdentityResolveIdentity.CallOptions,
  ): Promise<ComAtprotoIdentityResolveIdentity.Response> {
    return this._client
      .call('com.atproto.identity.resolveIdentity', params, undefined, opts)
      .catch((e) => {
        throw ComAtprotoIdentityResolveIdentity.toKnownErr(e)
      })
  }

  signPlcOperation(
    data?: ComAtprotoIdentitySignPlcOperation.InputSchema,
    opts?: ComAtprotoIdentitySignPlcOperation.CallOptions,
  ): Promise<ComAtprotoIdentitySignPlcOperation.Response> {
    return this._client.call(
      'com.atproto.identity.signPlcOperation',
      opts?.qp,
      data,
      opts,
    )
  }

  submitPlcOperation(
    data?: ComAtprotoIdentitySubmitPlcOperation.InputSchema,
    opts?: ComAtprotoIdentitySubmitPlcOperation.CallOptions,
  ): Promise<ComAtprotoIdentitySubmitPlcOperation.Response> {
    return this._client.call(
      'com.atproto.identity.submitPlcOperation',
      opts?.qp,
      data,
      opts,
    )
  }

  updateHandle(
    data?: ComAtprotoIdentityUpdateHandle.InputSchema,
    opts?: ComAtprotoIdentityUpdateHandle.CallOptions,
  ): Promise<ComAtprotoIdentityUpdateHandle.Response> {
    return this._client.call(
      'com.atproto.identity.updateHandle',
      opts?.qp,
      data,
      opts,
    )
  }
}

export class ComAtprotoLabelNS {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }

  queryLabels(
    params?: ComAtprotoLabelQueryLabels.QueryParams,
    opts?: ComAtprotoLabelQueryLabels.CallOptions,
  ): Promise<ComAtprotoLabelQueryLabels.Response> {
    return this._client.call(
      'com.atproto.label.queryLabels',
      params,
      undefined,
      opts,
    )
  }
}

export class ComAtprotoServerNS {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }

  activateAccount(
    data?: ComAtprotoServerActivateAccount.InputSchema,
    opts?: ComAtprotoServerActivateAccount.CallOptions,
  ): Promise<ComAtprotoServerActivateAccount.Response> {
    return this._client.call(
      'com.atproto.server.activateAccount',
      opts?.qp,
      data,
      opts,
    )
  }

  checkAccountStatus(
    params?: ComAtprotoServerCheckAccountStatus.QueryParams,
    opts?: ComAtprotoServerCheckAccountStatus.CallOptions,
  ): Promise<ComAtprotoServerCheckAccountStatus.Response> {
    return this._client.call(
      'com.atproto.server.checkAccountStatus',
      params,
      undefined,
      opts,
    )
  }

  confirmEmail(
    data?: ComAtprotoServerConfirmEmail.InputSchema,
    opts?: ComAtprotoServerConfirmEmail.CallOptions,
  ): Promise<ComAtprotoServerConfirmEmail.Response> {
    return this._client
      .call('com.atproto.server.confirmEmail', opts?.qp, data, opts)
      .catch((e) => {
        throw ComAtprotoServerConfirmEmail.toKnownErr(e)
      })
  }

  createAccount(
    data?: ComAtprotoServerCreateAccount.InputSchema,
    opts?: ComAtprotoServerCreateAccount.CallOptions,
  ): Promise<ComAtprotoServerCreateAccount.Response> {
    return this._client
      .call('com.atproto.server.createAccount', opts?.qp, data, opts)
      .catch((e) => {
        throw ComAtprotoServerCreateAccount.toKnownErr(e)
      })
  }

  createAppPassword(
    data?: ComAtprotoServerCreateAppPassword.InputSchema,
    opts?: ComAtprotoServerCreateAppPassword.CallOptions,
  ): Promise<ComAtprotoServerCreateAppPassword.Response> {
    return this._client
      .call('com.atproto.server.createAppPassword', opts?.qp, data, opts)
      .catch((e) => {
        throw ComAtprotoServerCreateAppPassword.toKnownErr(e)
      })
  }

  createInviteCode(
    data?: ComAtprotoServerCreateInviteCode.InputSchema,
    opts?: ComAtprotoServerCreateInviteCode.CallOptions,
  ): Promise<ComAtprotoServerCreateInviteCode.Response> {
    return this._client.call(
      'com.atproto.server.createInviteCode',
      opts?.qp,
      data,
      opts,
    )
  }

  createInviteCodes(
    data?: ComAtprotoServerCreateInviteCodes.InputSchema,
    opts?: ComAtprotoServerCreateInviteCodes.CallOptions,
  ): Promise<ComAtprotoServerCreateInviteCodes.Response> {
    return this._client.call(
      'com.atproto.server.createInviteCodes',
      opts?.qp,
      data,
      opts,
    )
  }

  createSession(
    data?: ComAtprotoServerCreateSession.InputSchema,
    opts?: ComAtprotoServerCreateSession.CallOptions,
  ): Promise<ComAtprotoServerCreateSession.Response> {
    return this._client
      .call('com.atproto.server.createSession', opts?.qp, data, opts)
      .catch((e) => {
        throw ComAtprotoServerCreateSession.toKnownErr(e)
      })
  }

  deactivateAccount(
    data?: ComAtprotoServerDeactivateAccount.InputSchema,
    opts?: ComAtprotoServerDeactivateAccount.CallOptions,
  ): Promise<ComAtprotoServerDeactivateAccount.Response> {
    return this._client.call(
      'com.atproto.server.deactivateAccount',
      opts?.qp,
      data,
      opts,
    )
  }

  deleteAccount(
    data?: ComAtprotoServerDeleteAccount.InputSchema,
    opts?: ComAtprotoServerDeleteAccount.CallOptions,
  ): Promise<ComAtprotoServerDeleteAccount.Response> {
    return this._client
      .call('com.atproto.server.deleteAccount', opts?.qp, data, opts)
      .catch((e) => {
        throw ComAtprotoServerDeleteAccount.toKnownErr(e)
      })
  }

  deleteSession(
    data?: ComAtprotoServerDeleteSession.InputSchema,
    opts?: ComAtprotoServerDeleteSession.CallOptions,
  ): Promise<ComAtprotoServerDeleteSession.Response> {
    return this._client.call(
      'com.atproto.server.deleteSession',
      opts?.qp,
      data,
      opts,
    )
  }

  describeServer(
    params?: ComAtprotoServerDescribeServer.QueryParams,
    opts?: ComAtprotoServerDescribeServer.CallOptions,
  ): Promise<ComAtprotoServerDescribeServer.Response> {
    return this._client.call(
      'com.atproto.server.describeServer',
      params,
      undefined,
      opts,
    )
  }

  getAccountInviteCodes(
    params?: ComAtprotoServerGetAccountInviteCodes.QueryParams,
    opts?: ComAtprotoServerGetAccountInviteCodes.CallOptions,
  ): Promise<ComAtprotoServerGetAccountInviteCodes.Response> {
    return this._client
      .call('com.atproto.server.getAccountInviteCodes', params, undefined, opts)
      .catch((e) => {
        throw ComAtprotoServerGetAccountInviteCodes.toKnownErr(e)
      })
  }

  getServiceAuth(
    params?: ComAtprotoServerGetServiceAuth.QueryParams,
    opts?: ComAtprotoServerGetServiceAuth.CallOptions,
  ): Promise<ComAtprotoServerGetServiceAuth.Response> {
    return this._client
      .call('com.atproto.server.getServiceAuth', params, undefined, opts)
      .catch((e) => {
        throw ComAtprotoServerGetServiceAuth.toKnownErr(e)
      })
  }

  getSession(
    params?: ComAtprotoServerGetSession.QueryParams,
    opts?: ComAtprotoServerGetSession.CallOptions,
  ): Promise<ComAtprotoServerGetSession.Response> {
    return this._client.call(
      'com.atproto.server.getSession',
      params,
      undefined,
      opts,
    )
  }

  listAppPasswords(
    params?: ComAtprotoServerListAppPasswords.QueryParams,
    opts?: ComAtprotoServerListAppPasswords.CallOptions,
  ): Promise<ComAtprotoServerListAppPasswords.Response> {
    return this._client
      .call('com.atproto.server.listAppPasswords', params, undefined, opts)
      .catch((e) => {
        throw ComAtprotoServerListAppPasswords.toKnownErr(e)
      })
  }

  refreshSession(
    data?: ComAtprotoServerRefreshSession.InputSchema,
    opts?: ComAtprotoServerRefreshSession.CallOptions,
  ): Promise<ComAtprotoServerRefreshSession.Response> {
    return this._client
      .call('com.atproto.server.refreshSession', opts?.qp, data, opts)
      .catch((e) => {
        throw ComAtprotoServerRefreshSession.toKnownErr(e)
      })
  }

  requestAccountDelete(
    data?: ComAtprotoServerRequestAccountDelete.InputSchema,
    opts?: ComAtprotoServerRequestAccountDelete.CallOptions,
  ): Promise<ComAtprotoServerRequestAccountDelete.Response> {
    return this._client.call(
      'com.atproto.server.requestAccountDelete',
      opts?.qp,
      data,
      opts,
    )
  }

  requestEmailConfirmation(
    data?: ComAtprotoServerRequestEmailConfirmation.InputSchema,
    opts?: ComAtprotoServerRequestEmailConfirmation.CallOptions,
  ): Promise<ComAtprotoServerRequestEmailConfirmation.Response> {
    return this._client.call(
      'com.atproto.server.requestEmailConfirmation',
      opts?.qp,
      data,
      opts,
    )
  }

  requestEmailUpdate(
    data?: ComAtprotoServerRequestEmailUpdate.InputSchema,
    opts?: ComAtprotoServerRequestEmailUpdate.CallOptions,
  ): Promise<ComAtprotoServerRequestEmailUpdate.Response> {
    return this._client.call(
      'com.atproto.server.requestEmailUpdate',
      opts?.qp,
      data,
      opts,
    )
  }

  requestPasswordReset(
    data?: ComAtprotoServerRequestPasswordReset.InputSchema,
    opts?: ComAtprotoServerRequestPasswordReset.CallOptions,
  ): Promise<ComAtprotoServerRequestPasswordReset.Response> {
    return this._client.call(
      'com.atproto.server.requestPasswordReset',
      opts?.qp,
      data,
      opts,
    )
  }

  reserveSigningKey(
    data?: ComAtprotoServerReserveSigningKey.InputSchema,
    opts?: ComAtprotoServerReserveSigningKey.CallOptions,
  ): Promise<ComAtprotoServerReserveSigningKey.Response> {
    return this._client.call(
      'com.atproto.server.reserveSigningKey',
      opts?.qp,
      data,
      opts,
    )
  }

  resetPassword(
    data?: ComAtprotoServerResetPassword.InputSchema,
    opts?: ComAtprotoServerResetPassword.CallOptions,
  ): Promise<ComAtprotoServerResetPassword.Response> {
    return this._client
      .call('com.atproto.server.resetPassword', opts?.qp, data, opts)
      .catch((e) => {
        throw ComAtprotoServerResetPassword.toKnownErr(e)
      })
  }

  revokeAppPassword(
    data?: ComAtprotoServerRevokeAppPassword.InputSchema,
    opts?: ComAtprotoServerRevokeAppPassword.CallOptions,
  ): Promise<ComAtprotoServerRevokeAppPassword.Response> {
    return this._client.call(
      'com.atproto.server.revokeAppPassword',
      opts?.qp,
      data,
      opts,
    )
  }

  updateEmail(
    data?: ComAtprotoServerUpdateEmail.InputSchema,
    opts?: ComAtprotoServerUpdateEmail.CallOptions,
  ): Promise<ComAtprotoServerUpdateEmail.Response> {
    return this._client
      .call('com.atproto.server.updateEmail', opts?.qp, data, opts)
      .catch((e) => {
        throw ComAtprotoServerUpdateEmail.toKnownErr(e)
      })
  }
}

export class ComAtprotoModerationNS {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }

  createReport(
    data?: ComAtprotoModerationCreateReport.InputSchema,
    opts?: ComAtprotoModerationCreateReport.CallOptions,
  ): Promise<ComAtprotoModerationCreateReport.Response> {
    return this._client.call(
      'com.atproto.moderation.createReport',
      opts?.qp,
      data,
      opts,
    )
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
  feed: AppBskyFeedNS
  embed: AppBskyEmbedNS
  graph: AppBskyGraphNS
  labeler: AppBskyLabelerNS
  notification: AppBskyNotificationNS
  unspecced: AppBskyUnspeccedNS
  video: AppBskyVideoNS
  actor: AppBskyActorNS
  richtext: AppBskyRichtextNS

  constructor(client: XrpcClient) {
    this._client = client
    this.feed = new AppBskyFeedNS(client)
    this.embed = new AppBskyEmbedNS(client)
    this.graph = new AppBskyGraphNS(client)
    this.labeler = new AppBskyLabelerNS(client)
    this.notification = new AppBskyNotificationNS(client)
    this.unspecced = new AppBskyUnspeccedNS(client)
    this.video = new AppBskyVideoNS(client)
    this.actor = new AppBskyActorNS(client)
    this.richtext = new AppBskyRichtextNS(client)
  }
}

export class AppBskyFeedNS {
  _client: XrpcClient
  generator: GeneratorRecord
  like: LikeRecord
  postgate: PostgateRecord
  post: PostRecord
  repost: RepostRecord
  threadgate: ThreadgateRecord

  constructor(client: XrpcClient) {
    this._client = client
    this.generator = new GeneratorRecord(client)
    this.like = new LikeRecord(client)
    this.postgate = new PostgateRecord(client)
    this.post = new PostRecord(client)
    this.repost = new RepostRecord(client)
    this.threadgate = new ThreadgateRecord(client)
  }

  describeFeedGenerator(
    params?: AppBskyFeedDescribeFeedGenerator.QueryParams,
    opts?: AppBskyFeedDescribeFeedGenerator.CallOptions,
  ): Promise<AppBskyFeedDescribeFeedGenerator.Response> {
    return this._client.call(
      'app.bsky.feed.describeFeedGenerator',
      params,
      undefined,
      opts,
    )
  }

  getActorFeeds(
    params?: AppBskyFeedGetActorFeeds.QueryParams,
    opts?: AppBskyFeedGetActorFeeds.CallOptions,
  ): Promise<AppBskyFeedGetActorFeeds.Response> {
    return this._client.call(
      'app.bsky.feed.getActorFeeds',
      params,
      undefined,
      opts,
    )
  }

  getActorLikes(
    params?: AppBskyFeedGetActorLikes.QueryParams,
    opts?: AppBskyFeedGetActorLikes.CallOptions,
  ): Promise<AppBskyFeedGetActorLikes.Response> {
    return this._client
      .call('app.bsky.feed.getActorLikes', params, undefined, opts)
      .catch((e) => {
        throw AppBskyFeedGetActorLikes.toKnownErr(e)
      })
  }

  getAuthorFeed(
    params?: AppBskyFeedGetAuthorFeed.QueryParams,
    opts?: AppBskyFeedGetAuthorFeed.CallOptions,
  ): Promise<AppBskyFeedGetAuthorFeed.Response> {
    return this._client
      .call('app.bsky.feed.getAuthorFeed', params, undefined, opts)
      .catch((e) => {
        throw AppBskyFeedGetAuthorFeed.toKnownErr(e)
      })
  }

  getFeedGenerator(
    params?: AppBskyFeedGetFeedGenerator.QueryParams,
    opts?: AppBskyFeedGetFeedGenerator.CallOptions,
  ): Promise<AppBskyFeedGetFeedGenerator.Response> {
    return this._client.call(
      'app.bsky.feed.getFeedGenerator',
      params,
      undefined,
      opts,
    )
  }

  getFeedGenerators(
    params?: AppBskyFeedGetFeedGenerators.QueryParams,
    opts?: AppBskyFeedGetFeedGenerators.CallOptions,
  ): Promise<AppBskyFeedGetFeedGenerators.Response> {
    return this._client.call(
      'app.bsky.feed.getFeedGenerators',
      params,
      undefined,
      opts,
    )
  }

  getFeed(
    params?: AppBskyFeedGetFeed.QueryParams,
    opts?: AppBskyFeedGetFeed.CallOptions,
  ): Promise<AppBskyFeedGetFeed.Response> {
    return this._client
      .call('app.bsky.feed.getFeed', params, undefined, opts)
      .catch((e) => {
        throw AppBskyFeedGetFeed.toKnownErr(e)
      })
  }

  getFeedSkeleton(
    params?: AppBskyFeedGetFeedSkeleton.QueryParams,
    opts?: AppBskyFeedGetFeedSkeleton.CallOptions,
  ): Promise<AppBskyFeedGetFeedSkeleton.Response> {
    return this._client
      .call('app.bsky.feed.getFeedSkeleton', params, undefined, opts)
      .catch((e) => {
        throw AppBskyFeedGetFeedSkeleton.toKnownErr(e)
      })
  }

  getLikes(
    params?: AppBskyFeedGetLikes.QueryParams,
    opts?: AppBskyFeedGetLikes.CallOptions,
  ): Promise<AppBskyFeedGetLikes.Response> {
    return this._client.call('app.bsky.feed.getLikes', params, undefined, opts)
  }

  getListFeed(
    params?: AppBskyFeedGetListFeed.QueryParams,
    opts?: AppBskyFeedGetListFeed.CallOptions,
  ): Promise<AppBskyFeedGetListFeed.Response> {
    return this._client
      .call('app.bsky.feed.getListFeed', params, undefined, opts)
      .catch((e) => {
        throw AppBskyFeedGetListFeed.toKnownErr(e)
      })
  }

  getPosts(
    params?: AppBskyFeedGetPosts.QueryParams,
    opts?: AppBskyFeedGetPosts.CallOptions,
  ): Promise<AppBskyFeedGetPosts.Response> {
    return this._client.call('app.bsky.feed.getPosts', params, undefined, opts)
  }

  getPostThread(
    params?: AppBskyFeedGetPostThread.QueryParams,
    opts?: AppBskyFeedGetPostThread.CallOptions,
  ): Promise<AppBskyFeedGetPostThread.Response> {
    return this._client
      .call('app.bsky.feed.getPostThread', params, undefined, opts)
      .catch((e) => {
        throw AppBskyFeedGetPostThread.toKnownErr(e)
      })
  }

  getQuotes(
    params?: AppBskyFeedGetQuotes.QueryParams,
    opts?: AppBskyFeedGetQuotes.CallOptions,
  ): Promise<AppBskyFeedGetQuotes.Response> {
    return this._client.call('app.bsky.feed.getQuotes', params, undefined, opts)
  }

  getRepostedBy(
    params?: AppBskyFeedGetRepostedBy.QueryParams,
    opts?: AppBskyFeedGetRepostedBy.CallOptions,
  ): Promise<AppBskyFeedGetRepostedBy.Response> {
    return this._client.call(
      'app.bsky.feed.getRepostedBy',
      params,
      undefined,
      opts,
    )
  }

  getSuggestedFeeds(
    params?: AppBskyFeedGetSuggestedFeeds.QueryParams,
    opts?: AppBskyFeedGetSuggestedFeeds.CallOptions,
  ): Promise<AppBskyFeedGetSuggestedFeeds.Response> {
    return this._client.call(
      'app.bsky.feed.getSuggestedFeeds',
      params,
      undefined,
      opts,
    )
  }

  getTimeline(
    params?: AppBskyFeedGetTimeline.QueryParams,
    opts?: AppBskyFeedGetTimeline.CallOptions,
  ): Promise<AppBskyFeedGetTimeline.Response> {
    return this._client.call(
      'app.bsky.feed.getTimeline',
      params,
      undefined,
      opts,
    )
  }

  searchPosts(
    params?: AppBskyFeedSearchPosts.QueryParams,
    opts?: AppBskyFeedSearchPosts.CallOptions,
  ): Promise<AppBskyFeedSearchPosts.Response> {
    return this._client
      .call('app.bsky.feed.searchPosts', params, undefined, opts)
      .catch((e) => {
        throw AppBskyFeedSearchPosts.toKnownErr(e)
      })
  }

  sendInteractions(
    data?: AppBskyFeedSendInteractions.InputSchema,
    opts?: AppBskyFeedSendInteractions.CallOptions,
  ): Promise<AppBskyFeedSendInteractions.Response> {
    return this._client.call(
      'app.bsky.feed.sendInteractions',
      opts?.qp,
      data,
      opts,
    )
  }
}

export class GeneratorRecord {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }

  async list(
    params: OmitKey<ComAtprotoRepoListRecords.QueryParams, 'collection'>,
  ): Promise<{
    cursor?: string
    records: { uri: string; value: AppBskyFeedGenerator.Record }[]
  }> {
    const res = await this._client.call('com.atproto.repo.listRecords', {
      collection: 'app.bsky.feed.generator',
      ...params,
    })
    return res.data
  }

  async get(
    params: OmitKey<ComAtprotoRepoGetRecord.QueryParams, 'collection'>,
  ): Promise<{ uri: string; cid: string; value: AppBskyFeedGenerator.Record }> {
    const res = await this._client.call('com.atproto.repo.getRecord', {
      collection: 'app.bsky.feed.generator',
      ...params,
    })
    return res.data
  }

  async create(
    params: OmitKey<
      ComAtprotoRepoCreateRecord.InputSchema,
      'collection' | 'record'
    >,
    record: Un$Typed<AppBskyFeedGenerator.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = 'app.bsky.feed.generator'
    const res = await this._client.call(
      'com.atproto.repo.createRecord',
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
      { collection: 'app.bsky.feed.generator', ...params },
      { headers },
    )
  }
}

export class LikeRecord {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }

  async list(
    params: OmitKey<ComAtprotoRepoListRecords.QueryParams, 'collection'>,
  ): Promise<{
    cursor?: string
    records: { uri: string; value: AppBskyFeedLike.Record }[]
  }> {
    const res = await this._client.call('com.atproto.repo.listRecords', {
      collection: 'app.bsky.feed.like',
      ...params,
    })
    return res.data
  }

  async get(
    params: OmitKey<ComAtprotoRepoGetRecord.QueryParams, 'collection'>,
  ): Promise<{ uri: string; cid: string; value: AppBskyFeedLike.Record }> {
    const res = await this._client.call('com.atproto.repo.getRecord', {
      collection: 'app.bsky.feed.like',
      ...params,
    })
    return res.data
  }

  async create(
    params: OmitKey<
      ComAtprotoRepoCreateRecord.InputSchema,
      'collection' | 'record'
    >,
    record: Un$Typed<AppBskyFeedLike.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = 'app.bsky.feed.like'
    const res = await this._client.call(
      'com.atproto.repo.createRecord',
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
      { collection: 'app.bsky.feed.like', ...params },
      { headers },
    )
  }
}

export class PostgateRecord {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }

  async list(
    params: OmitKey<ComAtprotoRepoListRecords.QueryParams, 'collection'>,
  ): Promise<{
    cursor?: string
    records: { uri: string; value: AppBskyFeedPostgate.Record }[]
  }> {
    const res = await this._client.call('com.atproto.repo.listRecords', {
      collection: 'app.bsky.feed.postgate',
      ...params,
    })
    return res.data
  }

  async get(
    params: OmitKey<ComAtprotoRepoGetRecord.QueryParams, 'collection'>,
  ): Promise<{ uri: string; cid: string; value: AppBskyFeedPostgate.Record }> {
    const res = await this._client.call('com.atproto.repo.getRecord', {
      collection: 'app.bsky.feed.postgate',
      ...params,
    })
    return res.data
  }

  async create(
    params: OmitKey<
      ComAtprotoRepoCreateRecord.InputSchema,
      'collection' | 'record'
    >,
    record: Un$Typed<AppBskyFeedPostgate.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = 'app.bsky.feed.postgate'
    const res = await this._client.call(
      'com.atproto.repo.createRecord',
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
      { collection: 'app.bsky.feed.postgate', ...params },
      { headers },
    )
  }
}

export class PostRecord {
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

export class RepostRecord {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }

  async list(
    params: OmitKey<ComAtprotoRepoListRecords.QueryParams, 'collection'>,
  ): Promise<{
    cursor?: string
    records: { uri: string; value: AppBskyFeedRepost.Record }[]
  }> {
    const res = await this._client.call('com.atproto.repo.listRecords', {
      collection: 'app.bsky.feed.repost',
      ...params,
    })
    return res.data
  }

  async get(
    params: OmitKey<ComAtprotoRepoGetRecord.QueryParams, 'collection'>,
  ): Promise<{ uri: string; cid: string; value: AppBskyFeedRepost.Record }> {
    const res = await this._client.call('com.atproto.repo.getRecord', {
      collection: 'app.bsky.feed.repost',
      ...params,
    })
    return res.data
  }

  async create(
    params: OmitKey<
      ComAtprotoRepoCreateRecord.InputSchema,
      'collection' | 'record'
    >,
    record: Un$Typed<AppBskyFeedRepost.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = 'app.bsky.feed.repost'
    const res = await this._client.call(
      'com.atproto.repo.createRecord',
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
      { collection: 'app.bsky.feed.repost', ...params },
      { headers },
    )
  }
}

export class ThreadgateRecord {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }

  async list(
    params: OmitKey<ComAtprotoRepoListRecords.QueryParams, 'collection'>,
  ): Promise<{
    cursor?: string
    records: { uri: string; value: AppBskyFeedThreadgate.Record }[]
  }> {
    const res = await this._client.call('com.atproto.repo.listRecords', {
      collection: 'app.bsky.feed.threadgate',
      ...params,
    })
    return res.data
  }

  async get(
    params: OmitKey<ComAtprotoRepoGetRecord.QueryParams, 'collection'>,
  ): Promise<{
    uri: string
    cid: string
    value: AppBskyFeedThreadgate.Record
  }> {
    const res = await this._client.call('com.atproto.repo.getRecord', {
      collection: 'app.bsky.feed.threadgate',
      ...params,
    })
    return res.data
  }

  async create(
    params: OmitKey<
      ComAtprotoRepoCreateRecord.InputSchema,
      'collection' | 'record'
    >,
    record: Un$Typed<AppBskyFeedThreadgate.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = 'app.bsky.feed.threadgate'
    const res = await this._client.call(
      'com.atproto.repo.createRecord',
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
      { collection: 'app.bsky.feed.threadgate', ...params },
      { headers },
    )
  }
}

export class AppBskyEmbedNS {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }
}

export class AppBskyGraphNS {
  _client: XrpcClient
  block: BlockRecord
  follow: FollowRecord
  listblock: ListblockRecord
  listitem: ListitemRecord
  list: ListRecord
  starterpack: StarterpackRecord

  constructor(client: XrpcClient) {
    this._client = client
    this.block = new BlockRecord(client)
    this.follow = new FollowRecord(client)
    this.listblock = new ListblockRecord(client)
    this.listitem = new ListitemRecord(client)
    this.list = new ListRecord(client)
    this.starterpack = new StarterpackRecord(client)
  }

  getActorStarterPacks(
    params?: AppBskyGraphGetActorStarterPacks.QueryParams,
    opts?: AppBskyGraphGetActorStarterPacks.CallOptions,
  ): Promise<AppBskyGraphGetActorStarterPacks.Response> {
    return this._client.call(
      'app.bsky.graph.getActorStarterPacks',
      params,
      undefined,
      opts,
    )
  }

  getBlocks(
    params?: AppBskyGraphGetBlocks.QueryParams,
    opts?: AppBskyGraphGetBlocks.CallOptions,
  ): Promise<AppBskyGraphGetBlocks.Response> {
    return this._client.call(
      'app.bsky.graph.getBlocks',
      params,
      undefined,
      opts,
    )
  }

  getFollowers(
    params?: AppBskyGraphGetFollowers.QueryParams,
    opts?: AppBskyGraphGetFollowers.CallOptions,
  ): Promise<AppBskyGraphGetFollowers.Response> {
    return this._client.call(
      'app.bsky.graph.getFollowers',
      params,
      undefined,
      opts,
    )
  }

  getFollows(
    params?: AppBskyGraphGetFollows.QueryParams,
    opts?: AppBskyGraphGetFollows.CallOptions,
  ): Promise<AppBskyGraphGetFollows.Response> {
    return this._client.call(
      'app.bsky.graph.getFollows',
      params,
      undefined,
      opts,
    )
  }

  getKnownFollowers(
    params?: AppBskyGraphGetKnownFollowers.QueryParams,
    opts?: AppBskyGraphGetKnownFollowers.CallOptions,
  ): Promise<AppBskyGraphGetKnownFollowers.Response> {
    return this._client.call(
      'app.bsky.graph.getKnownFollowers',
      params,
      undefined,
      opts,
    )
  }

  getListBlocks(
    params?: AppBskyGraphGetListBlocks.QueryParams,
    opts?: AppBskyGraphGetListBlocks.CallOptions,
  ): Promise<AppBskyGraphGetListBlocks.Response> {
    return this._client.call(
      'app.bsky.graph.getListBlocks',
      params,
      undefined,
      opts,
    )
  }

  getList(
    params?: AppBskyGraphGetList.QueryParams,
    opts?: AppBskyGraphGetList.CallOptions,
  ): Promise<AppBskyGraphGetList.Response> {
    return this._client.call('app.bsky.graph.getList', params, undefined, opts)
  }

  getListMutes(
    params?: AppBskyGraphGetListMutes.QueryParams,
    opts?: AppBskyGraphGetListMutes.CallOptions,
  ): Promise<AppBskyGraphGetListMutes.Response> {
    return this._client.call(
      'app.bsky.graph.getListMutes',
      params,
      undefined,
      opts,
    )
  }

  getLists(
    params?: AppBskyGraphGetLists.QueryParams,
    opts?: AppBskyGraphGetLists.CallOptions,
  ): Promise<AppBskyGraphGetLists.Response> {
    return this._client.call('app.bsky.graph.getLists', params, undefined, opts)
  }

  getMutes(
    params?: AppBskyGraphGetMutes.QueryParams,
    opts?: AppBskyGraphGetMutes.CallOptions,
  ): Promise<AppBskyGraphGetMutes.Response> {
    return this._client.call('app.bsky.graph.getMutes', params, undefined, opts)
  }

  getRelationships(
    params?: AppBskyGraphGetRelationships.QueryParams,
    opts?: AppBskyGraphGetRelationships.CallOptions,
  ): Promise<AppBskyGraphGetRelationships.Response> {
    return this._client
      .call('app.bsky.graph.getRelationships', params, undefined, opts)
      .catch((e) => {
        throw AppBskyGraphGetRelationships.toKnownErr(e)
      })
  }

  getStarterPack(
    params?: AppBskyGraphGetStarterPack.QueryParams,
    opts?: AppBskyGraphGetStarterPack.CallOptions,
  ): Promise<AppBskyGraphGetStarterPack.Response> {
    return this._client.call(
      'app.bsky.graph.getStarterPack',
      params,
      undefined,
      opts,
    )
  }

  getStarterPacks(
    params?: AppBskyGraphGetStarterPacks.QueryParams,
    opts?: AppBskyGraphGetStarterPacks.CallOptions,
  ): Promise<AppBskyGraphGetStarterPacks.Response> {
    return this._client.call(
      'app.bsky.graph.getStarterPacks',
      params,
      undefined,
      opts,
    )
  }

  getSuggestedFollowsByActor(
    params?: AppBskyGraphGetSuggestedFollowsByActor.QueryParams,
    opts?: AppBskyGraphGetSuggestedFollowsByActor.CallOptions,
  ): Promise<AppBskyGraphGetSuggestedFollowsByActor.Response> {
    return this._client.call(
      'app.bsky.graph.getSuggestedFollowsByActor',
      params,
      undefined,
      opts,
    )
  }

  muteActor(
    data?: AppBskyGraphMuteActor.InputSchema,
    opts?: AppBskyGraphMuteActor.CallOptions,
  ): Promise<AppBskyGraphMuteActor.Response> {
    return this._client.call('app.bsky.graph.muteActor', opts?.qp, data, opts)
  }

  muteActorList(
    data?: AppBskyGraphMuteActorList.InputSchema,
    opts?: AppBskyGraphMuteActorList.CallOptions,
  ): Promise<AppBskyGraphMuteActorList.Response> {
    return this._client.call(
      'app.bsky.graph.muteActorList',
      opts?.qp,
      data,
      opts,
    )
  }

  muteThread(
    data?: AppBskyGraphMuteThread.InputSchema,
    opts?: AppBskyGraphMuteThread.CallOptions,
  ): Promise<AppBskyGraphMuteThread.Response> {
    return this._client.call('app.bsky.graph.muteThread', opts?.qp, data, opts)
  }

  searchStarterPacks(
    params?: AppBskyGraphSearchStarterPacks.QueryParams,
    opts?: AppBskyGraphSearchStarterPacks.CallOptions,
  ): Promise<AppBskyGraphSearchStarterPacks.Response> {
    return this._client.call(
      'app.bsky.graph.searchStarterPacks',
      params,
      undefined,
      opts,
    )
  }

  unmuteActor(
    data?: AppBskyGraphUnmuteActor.InputSchema,
    opts?: AppBskyGraphUnmuteActor.CallOptions,
  ): Promise<AppBskyGraphUnmuteActor.Response> {
    return this._client.call('app.bsky.graph.unmuteActor', opts?.qp, data, opts)
  }

  unmuteActorList(
    data?: AppBskyGraphUnmuteActorList.InputSchema,
    opts?: AppBskyGraphUnmuteActorList.CallOptions,
  ): Promise<AppBskyGraphUnmuteActorList.Response> {
    return this._client.call(
      'app.bsky.graph.unmuteActorList',
      opts?.qp,
      data,
      opts,
    )
  }

  unmuteThread(
    data?: AppBskyGraphUnmuteThread.InputSchema,
    opts?: AppBskyGraphUnmuteThread.CallOptions,
  ): Promise<AppBskyGraphUnmuteThread.Response> {
    return this._client.call(
      'app.bsky.graph.unmuteThread',
      opts?.qp,
      data,
      opts,
    )
  }
}

export class BlockRecord {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }

  async list(
    params: OmitKey<ComAtprotoRepoListRecords.QueryParams, 'collection'>,
  ): Promise<{
    cursor?: string
    records: { uri: string; value: AppBskyGraphBlock.Record }[]
  }> {
    const res = await this._client.call('com.atproto.repo.listRecords', {
      collection: 'app.bsky.graph.block',
      ...params,
    })
    return res.data
  }

  async get(
    params: OmitKey<ComAtprotoRepoGetRecord.QueryParams, 'collection'>,
  ): Promise<{ uri: string; cid: string; value: AppBskyGraphBlock.Record }> {
    const res = await this._client.call('com.atproto.repo.getRecord', {
      collection: 'app.bsky.graph.block',
      ...params,
    })
    return res.data
  }

  async create(
    params: OmitKey<
      ComAtprotoRepoCreateRecord.InputSchema,
      'collection' | 'record'
    >,
    record: Un$Typed<AppBskyGraphBlock.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = 'app.bsky.graph.block'
    const res = await this._client.call(
      'com.atproto.repo.createRecord',
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
      { collection: 'app.bsky.graph.block', ...params },
      { headers },
    )
  }
}

export class FollowRecord {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }

  async list(
    params: OmitKey<ComAtprotoRepoListRecords.QueryParams, 'collection'>,
  ): Promise<{
    cursor?: string
    records: { uri: string; value: AppBskyGraphFollow.Record }[]
  }> {
    const res = await this._client.call('com.atproto.repo.listRecords', {
      collection: 'app.bsky.graph.follow',
      ...params,
    })
    return res.data
  }

  async get(
    params: OmitKey<ComAtprotoRepoGetRecord.QueryParams, 'collection'>,
  ): Promise<{ uri: string; cid: string; value: AppBskyGraphFollow.Record }> {
    const res = await this._client.call('com.atproto.repo.getRecord', {
      collection: 'app.bsky.graph.follow',
      ...params,
    })
    return res.data
  }

  async create(
    params: OmitKey<
      ComAtprotoRepoCreateRecord.InputSchema,
      'collection' | 'record'
    >,
    record: Un$Typed<AppBskyGraphFollow.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = 'app.bsky.graph.follow'
    const res = await this._client.call(
      'com.atproto.repo.createRecord',
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
      { collection: 'app.bsky.graph.follow', ...params },
      { headers },
    )
  }
}

export class ListblockRecord {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }

  async list(
    params: OmitKey<ComAtprotoRepoListRecords.QueryParams, 'collection'>,
  ): Promise<{
    cursor?: string
    records: { uri: string; value: AppBskyGraphListblock.Record }[]
  }> {
    const res = await this._client.call('com.atproto.repo.listRecords', {
      collection: 'app.bsky.graph.listblock',
      ...params,
    })
    return res.data
  }

  async get(
    params: OmitKey<ComAtprotoRepoGetRecord.QueryParams, 'collection'>,
  ): Promise<{
    uri: string
    cid: string
    value: AppBskyGraphListblock.Record
  }> {
    const res = await this._client.call('com.atproto.repo.getRecord', {
      collection: 'app.bsky.graph.listblock',
      ...params,
    })
    return res.data
  }

  async create(
    params: OmitKey<
      ComAtprotoRepoCreateRecord.InputSchema,
      'collection' | 'record'
    >,
    record: Un$Typed<AppBskyGraphListblock.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = 'app.bsky.graph.listblock'
    const res = await this._client.call(
      'com.atproto.repo.createRecord',
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
      { collection: 'app.bsky.graph.listblock', ...params },
      { headers },
    )
  }
}

export class ListitemRecord {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }

  async list(
    params: OmitKey<ComAtprotoRepoListRecords.QueryParams, 'collection'>,
  ): Promise<{
    cursor?: string
    records: { uri: string; value: AppBskyGraphListitem.Record }[]
  }> {
    const res = await this._client.call('com.atproto.repo.listRecords', {
      collection: 'app.bsky.graph.listitem',
      ...params,
    })
    return res.data
  }

  async get(
    params: OmitKey<ComAtprotoRepoGetRecord.QueryParams, 'collection'>,
  ): Promise<{ uri: string; cid: string; value: AppBskyGraphListitem.Record }> {
    const res = await this._client.call('com.atproto.repo.getRecord', {
      collection: 'app.bsky.graph.listitem',
      ...params,
    })
    return res.data
  }

  async create(
    params: OmitKey<
      ComAtprotoRepoCreateRecord.InputSchema,
      'collection' | 'record'
    >,
    record: Un$Typed<AppBskyGraphListitem.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = 'app.bsky.graph.listitem'
    const res = await this._client.call(
      'com.atproto.repo.createRecord',
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
      { collection: 'app.bsky.graph.listitem', ...params },
      { headers },
    )
  }
}

export class ListRecord {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }

  async list(
    params: OmitKey<ComAtprotoRepoListRecords.QueryParams, 'collection'>,
  ): Promise<{
    cursor?: string
    records: { uri: string; value: AppBskyGraphList.Record }[]
  }> {
    const res = await this._client.call('com.atproto.repo.listRecords', {
      collection: 'app.bsky.graph.list',
      ...params,
    })
    return res.data
  }

  async get(
    params: OmitKey<ComAtprotoRepoGetRecord.QueryParams, 'collection'>,
  ): Promise<{ uri: string; cid: string; value: AppBskyGraphList.Record }> {
    const res = await this._client.call('com.atproto.repo.getRecord', {
      collection: 'app.bsky.graph.list',
      ...params,
    })
    return res.data
  }

  async create(
    params: OmitKey<
      ComAtprotoRepoCreateRecord.InputSchema,
      'collection' | 'record'
    >,
    record: Un$Typed<AppBskyGraphList.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = 'app.bsky.graph.list'
    const res = await this._client.call(
      'com.atproto.repo.createRecord',
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
      { collection: 'app.bsky.graph.list', ...params },
      { headers },
    )
  }
}

export class StarterpackRecord {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }

  async list(
    params: OmitKey<ComAtprotoRepoListRecords.QueryParams, 'collection'>,
  ): Promise<{
    cursor?: string
    records: { uri: string; value: AppBskyGraphStarterpack.Record }[]
  }> {
    const res = await this._client.call('com.atproto.repo.listRecords', {
      collection: 'app.bsky.graph.starterpack',
      ...params,
    })
    return res.data
  }

  async get(
    params: OmitKey<ComAtprotoRepoGetRecord.QueryParams, 'collection'>,
  ): Promise<{
    uri: string
    cid: string
    value: AppBskyGraphStarterpack.Record
  }> {
    const res = await this._client.call('com.atproto.repo.getRecord', {
      collection: 'app.bsky.graph.starterpack',
      ...params,
    })
    return res.data
  }

  async create(
    params: OmitKey<
      ComAtprotoRepoCreateRecord.InputSchema,
      'collection' | 'record'
    >,
    record: Un$Typed<AppBskyGraphStarterpack.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = 'app.bsky.graph.starterpack'
    const res = await this._client.call(
      'com.atproto.repo.createRecord',
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
      { collection: 'app.bsky.graph.starterpack', ...params },
      { headers },
    )
  }
}

export class AppBskyLabelerNS {
  _client: XrpcClient
  service: ServiceRecord

  constructor(client: XrpcClient) {
    this._client = client
    this.service = new ServiceRecord(client)
  }

  getServices(
    params?: AppBskyLabelerGetServices.QueryParams,
    opts?: AppBskyLabelerGetServices.CallOptions,
  ): Promise<AppBskyLabelerGetServices.Response> {
    return this._client.call(
      'app.bsky.labeler.getServices',
      params,
      undefined,
      opts,
    )
  }
}

export class ServiceRecord {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }

  async list(
    params: OmitKey<ComAtprotoRepoListRecords.QueryParams, 'collection'>,
  ): Promise<{
    cursor?: string
    records: { uri: string; value: AppBskyLabelerService.Record }[]
  }> {
    const res = await this._client.call('com.atproto.repo.listRecords', {
      collection: 'app.bsky.labeler.service',
      ...params,
    })
    return res.data
  }

  async get(
    params: OmitKey<ComAtprotoRepoGetRecord.QueryParams, 'collection'>,
  ): Promise<{
    uri: string
    cid: string
    value: AppBskyLabelerService.Record
  }> {
    const res = await this._client.call('com.atproto.repo.getRecord', {
      collection: 'app.bsky.labeler.service',
      ...params,
    })
    return res.data
  }

  async create(
    params: OmitKey<
      ComAtprotoRepoCreateRecord.InputSchema,
      'collection' | 'record'
    >,
    record: Un$Typed<AppBskyLabelerService.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = 'app.bsky.labeler.service'
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

  async delete(
    params: OmitKey<ComAtprotoRepoDeleteRecord.InputSchema, 'collection'>,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._client.call(
      'com.atproto.repo.deleteRecord',
      undefined,
      { collection: 'app.bsky.labeler.service', ...params },
      { headers },
    )
  }
}

export class AppBskyNotificationNS {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }

  getUnreadCount(
    params?: AppBskyNotificationGetUnreadCount.QueryParams,
    opts?: AppBskyNotificationGetUnreadCount.CallOptions,
  ): Promise<AppBskyNotificationGetUnreadCount.Response> {
    return this._client.call(
      'app.bsky.notification.getUnreadCount',
      params,
      undefined,
      opts,
    )
  }

  listNotifications(
    params?: AppBskyNotificationListNotifications.QueryParams,
    opts?: AppBskyNotificationListNotifications.CallOptions,
  ): Promise<AppBskyNotificationListNotifications.Response> {
    return this._client.call(
      'app.bsky.notification.listNotifications',
      params,
      undefined,
      opts,
    )
  }

  putPreferences(
    data?: AppBskyNotificationPutPreferences.InputSchema,
    opts?: AppBskyNotificationPutPreferences.CallOptions,
  ): Promise<AppBskyNotificationPutPreferences.Response> {
    return this._client.call(
      'app.bsky.notification.putPreferences',
      opts?.qp,
      data,
      opts,
    )
  }

  registerPush(
    data?: AppBskyNotificationRegisterPush.InputSchema,
    opts?: AppBskyNotificationRegisterPush.CallOptions,
  ): Promise<AppBskyNotificationRegisterPush.Response> {
    return this._client.call(
      'app.bsky.notification.registerPush',
      opts?.qp,
      data,
      opts,
    )
  }

  updateSeen(
    data?: AppBskyNotificationUpdateSeen.InputSchema,
    opts?: AppBskyNotificationUpdateSeen.CallOptions,
  ): Promise<AppBskyNotificationUpdateSeen.Response> {
    return this._client.call(
      'app.bsky.notification.updateSeen',
      opts?.qp,
      data,
      opts,
    )
  }
}

export class AppBskyUnspeccedNS {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }

  getConfig(
    params?: AppBskyUnspeccedGetConfig.QueryParams,
    opts?: AppBskyUnspeccedGetConfig.CallOptions,
  ): Promise<AppBskyUnspeccedGetConfig.Response> {
    return this._client.call(
      'app.bsky.unspecced.getConfig',
      params,
      undefined,
      opts,
    )
  }

  getPopularFeedGenerators(
    params?: AppBskyUnspeccedGetPopularFeedGenerators.QueryParams,
    opts?: AppBskyUnspeccedGetPopularFeedGenerators.CallOptions,
  ): Promise<AppBskyUnspeccedGetPopularFeedGenerators.Response> {
    return this._client.call(
      'app.bsky.unspecced.getPopularFeedGenerators',
      params,
      undefined,
      opts,
    )
  }

  getSuggestionsSkeleton(
    params?: AppBskyUnspeccedGetSuggestionsSkeleton.QueryParams,
    opts?: AppBskyUnspeccedGetSuggestionsSkeleton.CallOptions,
  ): Promise<AppBskyUnspeccedGetSuggestionsSkeleton.Response> {
    return this._client.call(
      'app.bsky.unspecced.getSuggestionsSkeleton',
      params,
      undefined,
      opts,
    )
  }

  getTaggedSuggestions(
    params?: AppBskyUnspeccedGetTaggedSuggestions.QueryParams,
    opts?: AppBskyUnspeccedGetTaggedSuggestions.CallOptions,
  ): Promise<AppBskyUnspeccedGetTaggedSuggestions.Response> {
    return this._client.call(
      'app.bsky.unspecced.getTaggedSuggestions',
      params,
      undefined,
      opts,
    )
  }

  getTrendingTopics(
    params?: AppBskyUnspeccedGetTrendingTopics.QueryParams,
    opts?: AppBskyUnspeccedGetTrendingTopics.CallOptions,
  ): Promise<AppBskyUnspeccedGetTrendingTopics.Response> {
    return this._client.call(
      'app.bsky.unspecced.getTrendingTopics',
      params,
      undefined,
      opts,
    )
  }

  searchActorsSkeleton(
    params?: AppBskyUnspeccedSearchActorsSkeleton.QueryParams,
    opts?: AppBskyUnspeccedSearchActorsSkeleton.CallOptions,
  ): Promise<AppBskyUnspeccedSearchActorsSkeleton.Response> {
    return this._client
      .call('app.bsky.unspecced.searchActorsSkeleton', params, undefined, opts)
      .catch((e) => {
        throw AppBskyUnspeccedSearchActorsSkeleton.toKnownErr(e)
      })
  }

  searchPostsSkeleton(
    params?: AppBskyUnspeccedSearchPostsSkeleton.QueryParams,
    opts?: AppBskyUnspeccedSearchPostsSkeleton.CallOptions,
  ): Promise<AppBskyUnspeccedSearchPostsSkeleton.Response> {
    return this._client
      .call('app.bsky.unspecced.searchPostsSkeleton', params, undefined, opts)
      .catch((e) => {
        throw AppBskyUnspeccedSearchPostsSkeleton.toKnownErr(e)
      })
  }

  searchStarterPacksSkeleton(
    params?: AppBskyUnspeccedSearchStarterPacksSkeleton.QueryParams,
    opts?: AppBskyUnspeccedSearchStarterPacksSkeleton.CallOptions,
  ): Promise<AppBskyUnspeccedSearchStarterPacksSkeleton.Response> {
    return this._client
      .call(
        'app.bsky.unspecced.searchStarterPacksSkeleton',
        params,
        undefined,
        opts,
      )
      .catch((e) => {
        throw AppBskyUnspeccedSearchStarterPacksSkeleton.toKnownErr(e)
      })
  }
}

export class AppBskyVideoNS {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }

  getJobStatus(
    params?: AppBskyVideoGetJobStatus.QueryParams,
    opts?: AppBskyVideoGetJobStatus.CallOptions,
  ): Promise<AppBskyVideoGetJobStatus.Response> {
    return this._client.call(
      'app.bsky.video.getJobStatus',
      params,
      undefined,
      opts,
    )
  }

  getUploadLimits(
    params?: AppBskyVideoGetUploadLimits.QueryParams,
    opts?: AppBskyVideoGetUploadLimits.CallOptions,
  ): Promise<AppBskyVideoGetUploadLimits.Response> {
    return this._client.call(
      'app.bsky.video.getUploadLimits',
      params,
      undefined,
      opts,
    )
  }

  uploadVideo(
    data?: AppBskyVideoUploadVideo.InputSchema,
    opts?: AppBskyVideoUploadVideo.CallOptions,
  ): Promise<AppBskyVideoUploadVideo.Response> {
    return this._client.call('app.bsky.video.uploadVideo', opts?.qp, data, opts)
  }
}

export class AppBskyActorNS {
  _client: XrpcClient
  profile: ProfileRecord

  constructor(client: XrpcClient) {
    this._client = client
    this.profile = new ProfileRecord(client)
  }

  getPreferences(
    params?: AppBskyActorGetPreferences.QueryParams,
    opts?: AppBskyActorGetPreferences.CallOptions,
  ): Promise<AppBskyActorGetPreferences.Response> {
    return this._client.call(
      'app.bsky.actor.getPreferences',
      params,
      undefined,
      opts,
    )
  }

  getProfile(
    params?: AppBskyActorGetProfile.QueryParams,
    opts?: AppBskyActorGetProfile.CallOptions,
  ): Promise<AppBskyActorGetProfile.Response> {
    return this._client.call(
      'app.bsky.actor.getProfile',
      params,
      undefined,
      opts,
    )
  }

  getProfiles(
    params?: AppBskyActorGetProfiles.QueryParams,
    opts?: AppBskyActorGetProfiles.CallOptions,
  ): Promise<AppBskyActorGetProfiles.Response> {
    return this._client.call(
      'app.bsky.actor.getProfiles',
      params,
      undefined,
      opts,
    )
  }

  getSuggestions(
    params?: AppBskyActorGetSuggestions.QueryParams,
    opts?: AppBskyActorGetSuggestions.CallOptions,
  ): Promise<AppBskyActorGetSuggestions.Response> {
    return this._client.call(
      'app.bsky.actor.getSuggestions',
      params,
      undefined,
      opts,
    )
  }

  putPreferences(
    data?: AppBskyActorPutPreferences.InputSchema,
    opts?: AppBskyActorPutPreferences.CallOptions,
  ): Promise<AppBskyActorPutPreferences.Response> {
    return this._client.call(
      'app.bsky.actor.putPreferences',
      opts?.qp,
      data,
      opts,
    )
  }

  searchActors(
    params?: AppBskyActorSearchActors.QueryParams,
    opts?: AppBskyActorSearchActors.CallOptions,
  ): Promise<AppBskyActorSearchActors.Response> {
    return this._client.call(
      'app.bsky.actor.searchActors',
      params,
      undefined,
      opts,
    )
  }

  searchActorsTypeahead(
    params?: AppBskyActorSearchActorsTypeahead.QueryParams,
    opts?: AppBskyActorSearchActorsTypeahead.CallOptions,
  ): Promise<AppBskyActorSearchActorsTypeahead.Response> {
    return this._client.call(
      'app.bsky.actor.searchActorsTypeahead',
      params,
      undefined,
      opts,
    )
  }
}

export class ProfileRecord {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }

  async list(
    params: OmitKey<ComAtprotoRepoListRecords.QueryParams, 'collection'>,
  ): Promise<{
    cursor?: string
    records: { uri: string; value: AppBskyActorProfile.Record }[]
  }> {
    const res = await this._client.call('com.atproto.repo.listRecords', {
      collection: 'app.bsky.actor.profile',
      ...params,
    })
    return res.data
  }

  async get(
    params: OmitKey<ComAtprotoRepoGetRecord.QueryParams, 'collection'>,
  ): Promise<{ uri: string; cid: string; value: AppBskyActorProfile.Record }> {
    const res = await this._client.call('com.atproto.repo.getRecord', {
      collection: 'app.bsky.actor.profile',
      ...params,
    })
    return res.data
  }

  async create(
    params: OmitKey<
      ComAtprotoRepoCreateRecord.InputSchema,
      'collection' | 'record'
    >,
    record: Un$Typed<AppBskyActorProfile.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = 'app.bsky.actor.profile'
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

  async delete(
    params: OmitKey<ComAtprotoRepoDeleteRecord.InputSchema, 'collection'>,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._client.call(
      'com.atproto.repo.deleteRecord',
      undefined,
      { collection: 'app.bsky.actor.profile', ...params },
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
