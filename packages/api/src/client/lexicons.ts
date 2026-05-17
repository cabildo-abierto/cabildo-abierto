/**
 * GENERATED CODE - DO NOT MODIFY
 */
import {
  type LexiconDoc,
  Lexicons,
  ValidationError,
  type ValidationResult,
} from '@atproto/lexicon'
import { type $Typed, is$typed, maybe$typed } from './util.js'

export const schemaDict = {
  AppBskyActorDefs: {
    lexicon: 1,
    id: 'app.bsky.actor.defs',
    defs: {
      profileViewBasic: {
        type: 'object',
        required: ['did', 'handle'],
        properties: {
          did: {
            type: 'string',
            format: 'did',
          },
          handle: {
            type: 'string',
            format: 'handle',
          },
          displayName: {
            type: 'string',
            maxGraphemes: 64,
            maxLength: 640,
          },
          avatar: {
            type: 'string',
            format: 'uri',
          },
          associated: {
            type: 'ref',
            ref: 'lex:app.bsky.actor.defs#profileAssociated',
          },
          viewer: {
            type: 'ref',
            ref: 'lex:app.bsky.actor.defs#viewerState',
          },
          labels: {
            type: 'array',
            items: {
              type: 'ref',
              ref: 'lex:com.atproto.label.defs#label',
            },
          },
          createdAt: {
            type: 'string',
            format: 'datetime',
          },
        },
      },
      profileView: {
        type: 'object',
        required: ['did', 'handle'],
        properties: {
          did: {
            type: 'string',
            format: 'did',
          },
          handle: {
            type: 'string',
            format: 'handle',
          },
          displayName: {
            type: 'string',
            maxGraphemes: 64,
            maxLength: 640,
          },
          description: {
            type: 'string',
            maxGraphemes: 256,
            maxLength: 2560,
          },
          avatar: {
            type: 'string',
            format: 'uri',
          },
          associated: {
            type: 'ref',
            ref: 'lex:app.bsky.actor.defs#profileAssociated',
          },
          indexedAt: {
            type: 'string',
            format: 'datetime',
          },
          createdAt: {
            type: 'string',
            format: 'datetime',
          },
          viewer: {
            type: 'ref',
            ref: 'lex:app.bsky.actor.defs#viewerState',
          },
          labels: {
            type: 'array',
            items: {
              type: 'ref',
              ref: 'lex:com.atproto.label.defs#label',
            },
          },
        },
      },
      profileViewDetailed: {
        type: 'object',
        required: ['did', 'handle'],
        properties: {
          did: {
            type: 'string',
            format: 'did',
          },
          handle: {
            type: 'string',
            format: 'handle',
          },
          displayName: {
            type: 'string',
            maxGraphemes: 64,
            maxLength: 640,
          },
          description: {
            type: 'string',
            maxGraphemes: 256,
            maxLength: 2560,
          },
          avatar: {
            type: 'string',
            format: 'uri',
          },
          banner: {
            type: 'string',
            format: 'uri',
          },
          followersCount: {
            type: 'integer',
          },
          followsCount: {
            type: 'integer',
          },
          postsCount: {
            type: 'integer',
          },
          associated: {
            type: 'ref',
            ref: 'lex:app.bsky.actor.defs#profileAssociated',
          },
          joinedViaStarterPack: {
            type: 'ref',
            ref: 'lex:app.bsky.graph.defs#starterPackViewBasic',
          },
          indexedAt: {
            type: 'string',
            format: 'datetime',
          },
          createdAt: {
            type: 'string',
            format: 'datetime',
          },
          viewer: {
            type: 'ref',
            ref: 'lex:app.bsky.actor.defs#viewerState',
          },
          labels: {
            type: 'array',
            items: {
              type: 'ref',
              ref: 'lex:com.atproto.label.defs#label',
            },
          },
          pinnedPost: {
            type: 'ref',
            ref: 'lex:com.atproto.repo.strongRef',
          },
        },
      },
      profileAssociated: {
        type: 'object',
        properties: {
          lists: {
            type: 'integer',
          },
          feedgens: {
            type: 'integer',
          },
          starterPacks: {
            type: 'integer',
          },
          labeler: {
            type: 'boolean',
          },
          chat: {
            type: 'ref',
            ref: 'lex:app.bsky.actor.defs#profileAssociatedChat',
          },
        },
      },
      profileAssociatedChat: {
        type: 'object',
        required: ['allowIncoming'],
        properties: {
          allowIncoming: {
            type: 'string',
            knownValues: ['all', 'none', 'following'],
          },
        },
      },
      viewerState: {
        type: 'object',
        description:
          "Metadata about the requesting account's relationship with the subject account. Only has meaningful content for authed requests.",
        properties: {
          muted: {
            type: 'boolean',
          },
          mutedByList: {
            type: 'ref',
            ref: 'lex:app.bsky.graph.defs#listViewBasic',
          },
          blockedBy: {
            type: 'boolean',
          },
          blocking: {
            type: 'string',
            format: 'at-uri',
          },
          blockingByList: {
            type: 'ref',
            ref: 'lex:app.bsky.graph.defs#listViewBasic',
          },
          following: {
            type: 'string',
            format: 'at-uri',
          },
          followedBy: {
            type: 'string',
            format: 'at-uri',
          },
          knownFollowers: {
            type: 'ref',
            ref: 'lex:app.bsky.actor.defs#knownFollowers',
          },
        },
      },
      knownFollowers: {
        type: 'object',
        description: "The subject's followers whom you also follow",
        required: ['count', 'followers'],
        properties: {
          count: {
            type: 'integer',
          },
          followers: {
            type: 'array',
            minLength: 0,
            maxLength: 5,
            items: {
              type: 'ref',
              ref: 'lex:app.bsky.actor.defs#profileViewBasic',
            },
          },
        },
      },
    },
  },
  AppBskyEmbedDefs: {
    lexicon: 1,
    id: 'app.bsky.embed.defs',
    defs: {
      aspectRatio: {
        type: 'object',
        description:
          'width:height represents an aspect ratio. It may be approximate, and may not correspond to absolute dimensions in any given unit.',
        required: ['width', 'height'],
        properties: {
          width: {
            type: 'integer',
            minimum: 1,
          },
          height: {
            type: 'integer',
            minimum: 1,
          },
        },
      },
    },
  },
  AppBskyEmbedExternal: {
    lexicon: 1,
    id: 'app.bsky.embed.external',
    defs: {
      main: {
        type: 'object',
        description:
          "A representation of some externally linked content (eg, a URL and 'card'), embedded in a Bluesky record (eg, a post).",
        required: ['external'],
        properties: {
          external: {
            type: 'ref',
            ref: 'lex:app.bsky.embed.external#external',
          },
        },
      },
      external: {
        type: 'object',
        required: ['uri', 'title', 'description'],
        properties: {
          uri: {
            type: 'string',
            format: 'uri',
          },
          title: {
            type: 'string',
          },
          description: {
            type: 'string',
          },
          thumb: {
            type: 'blob',
            accept: ['image/*'],
            maxSize: 1000000,
          },
        },
      },
      view: {
        type: 'object',
        required: ['external'],
        properties: {
          external: {
            type: 'ref',
            ref: 'lex:app.bsky.embed.external#viewExternal',
          },
        },
      },
      viewExternal: {
        type: 'object',
        required: ['uri', 'title', 'description'],
        properties: {
          uri: {
            type: 'string',
            format: 'uri',
          },
          title: {
            type: 'string',
          },
          description: {
            type: 'string',
          },
          thumb: {
            type: 'string',
            format: 'uri',
          },
        },
      },
    },
  },
  AppBskyEmbedImages: {
    lexicon: 1,
    id: 'app.bsky.embed.images',
    description: 'A set of images embedded in a Bluesky record (eg, a post).',
    defs: {
      main: {
        type: 'object',
        required: ['images'],
        properties: {
          images: {
            type: 'array',
            items: {
              type: 'ref',
              ref: 'lex:app.bsky.embed.images#image',
            },
            maxLength: 4,
          },
        },
      },
      image: {
        type: 'object',
        required: ['image', 'alt'],
        properties: {
          image: {
            type: 'blob',
            accept: ['image/*'],
            maxSize: 1000000,
          },
          alt: {
            type: 'string',
            description:
              'Alt text description of the image, for accessibility.',
          },
          aspectRatio: {
            type: 'ref',
            ref: 'lex:app.bsky.embed.defs#aspectRatio',
          },
        },
      },
      view: {
        type: 'object',
        required: ['images'],
        properties: {
          images: {
            type: 'array',
            items: {
              type: 'ref',
              ref: 'lex:app.bsky.embed.images#viewImage',
            },
            maxLength: 4,
          },
        },
      },
      viewImage: {
        type: 'object',
        required: ['thumb', 'fullsize', 'alt'],
        properties: {
          thumb: {
            type: 'string',
            format: 'uri',
            description:
              'Fully-qualified URL where a thumbnail of the image can be fetched. For example, CDN location provided by the App View.',
          },
          fullsize: {
            type: 'string',
            format: 'uri',
            description:
              'Fully-qualified URL where a large version of the image can be fetched. May or may not be the exact original blob. For example, CDN location provided by the App View.',
          },
          alt: {
            type: 'string',
            description:
              'Alt text description of the image, for accessibility.',
          },
          aspectRatio: {
            type: 'ref',
            ref: 'lex:app.bsky.embed.defs#aspectRatio',
          },
        },
      },
    },
  },
  AppBskyEmbedRecord: {
    lexicon: 1,
    id: 'app.bsky.embed.record',
    description:
      'A representation of a record embedded in a Bluesky record (eg, a post). For example, a quote-post, or sharing a feed generator record.',
    defs: {
      main: {
        type: 'object',
        required: ['record'],
        properties: {
          record: {
            type: 'ref',
            ref: 'lex:com.atproto.repo.strongRef',
          },
        },
      },
      viewNotFound: {
        type: 'object',
        required: ['uri', 'notFound'],
        properties: {
          uri: {
            type: 'string',
            format: 'at-uri',
          },
          notFound: {
            type: 'boolean',
            const: true,
          },
        },
      },
      viewBlocked: {
        type: 'object',
        required: ['uri', 'blocked', 'author'],
        properties: {
          uri: {
            type: 'string',
            format: 'at-uri',
          },
          blocked: {
            type: 'boolean',
            const: true,
          },
          author: {
            type: 'ref',
            ref: 'lex:app.bsky.feed.defs#blockedAuthor',
          },
        },
      },
      viewDetached: {
        type: 'object',
        required: ['uri', 'detached'],
        properties: {
          uri: {
            type: 'string',
            format: 'at-uri',
          },
          detached: {
            type: 'boolean',
            const: true,
          },
        },
      },
    },
  },
  AppBskyEmbedRecordWithMedia: {
    lexicon: 1,
    id: 'app.bsky.embed.recordWithMedia',
    description:
      'A representation of a record embedded in a Bluesky record (eg, a post), alongside other compatible embeds. For example, a quote post and image, or a quote post and external URL card.',
    defs: {
      main: {
        type: 'object',
        required: ['record', 'media'],
        properties: {
          record: {
            type: 'ref',
            ref: 'lex:app.bsky.embed.record',
          },
          media: {
            type: 'union',
            refs: [
              'lex:app.bsky.embed.images',
              'lex:app.bsky.embed.video',
              'lex:app.bsky.embed.external',
            ],
          },
        },
      },
    },
  },
  AppBskyEmbedVideo: {
    lexicon: 1,
    id: 'app.bsky.embed.video',
    description: 'A video embedded in a Bluesky record (eg, a post).',
    defs: {
      main: {
        type: 'object',
        required: ['video'],
        properties: {
          video: {
            type: 'blob',
            description:
              'The mp4 video file. May be up to 100mb, formerly limited to 50mb.',
            accept: ['video/mp4'],
            maxSize: 100000000,
          },
          captions: {
            type: 'array',
            items: {
              type: 'ref',
              ref: 'lex:app.bsky.embed.video#caption',
            },
            maxLength: 20,
          },
          alt: {
            type: 'string',
            description:
              'Alt text description of the video, for accessibility.',
            maxGraphemes: 1000,
            maxLength: 10000,
          },
          aspectRatio: {
            type: 'ref',
            ref: 'lex:app.bsky.embed.defs#aspectRatio',
          },
        },
      },
      caption: {
        type: 'object',
        required: ['lang', 'file'],
        properties: {
          lang: {
            type: 'string',
            format: 'language',
          },
          file: {
            type: 'blob',
            accept: ['text/vtt'],
            maxSize: 20000,
          },
        },
      },
      view: {
        type: 'object',
        required: ['cid', 'playlist'],
        properties: {
          cid: {
            type: 'string',
            format: 'cid',
          },
          playlist: {
            type: 'string',
            format: 'uri',
          },
          thumbnail: {
            type: 'string',
            format: 'uri',
          },
          alt: {
            type: 'string',
            maxGraphemes: 1000,
            maxLength: 10000,
          },
          aspectRatio: {
            type: 'ref',
            ref: 'lex:app.bsky.embed.defs#aspectRatio',
          },
        },
      },
    },
  },
  AppBskyFeedDefs: {
    lexicon: 1,
    id: 'app.bsky.feed.defs',
    defs: {
      viewerState: {
        type: 'object',
        description:
          "Metadata about the requesting account's relationship with the subject content. Only has meaningful content for authed requests.",
        properties: {
          repost: {
            type: 'string',
            format: 'at-uri',
          },
          like: {
            type: 'string',
            format: 'at-uri',
          },
          threadMuted: {
            type: 'boolean',
          },
          replyDisabled: {
            type: 'boolean',
          },
          embeddingDisabled: {
            type: 'boolean',
          },
          pinned: {
            type: 'boolean',
          },
        },
      },
      threadContext: {
        type: 'object',
        description:
          'Metadata about this post within the context of the thread it is in.',
        properties: {
          rootAuthorLike: {
            type: 'string',
            format: 'at-uri',
          },
        },
      },
      reasonPin: {
        type: 'object',
        properties: {},
      },
      notFoundPost: {
        type: 'object',
        required: ['uri', 'notFound'],
        properties: {
          uri: {
            type: 'string',
            format: 'at-uri',
          },
          notFound: {
            type: 'boolean',
            const: true,
          },
        },
      },
      blockedPost: {
        type: 'object',
        required: ['uri', 'blocked', 'author'],
        properties: {
          uri: {
            type: 'string',
            format: 'at-uri',
          },
          blocked: {
            type: 'boolean',
            const: true,
          },
          author: {
            type: 'ref',
            ref: 'lex:app.bsky.feed.defs#blockedAuthor',
          },
        },
      },
      blockedAuthor: {
        type: 'object',
        required: ['did'],
        properties: {
          did: {
            type: 'string',
            format: 'did',
          },
          viewer: {
            type: 'ref',
            ref: 'lex:app.bsky.actor.defs#viewerState',
          },
        },
      },
      generatorView: {
        type: 'object',
        required: ['uri', 'cid', 'did', 'creator', 'displayName', 'indexedAt'],
        properties: {
          uri: {
            type: 'string',
            format: 'at-uri',
          },
          cid: {
            type: 'string',
            format: 'cid',
          },
          did: {
            type: 'string',
            format: 'did',
          },
          creator: {
            type: 'ref',
            ref: 'lex:app.bsky.actor.defs#profileView',
          },
          displayName: {
            type: 'string',
          },
          description: {
            type: 'string',
            maxGraphemes: 300,
            maxLength: 3000,
          },
          descriptionFacets: {
            type: 'array',
            items: {
              type: 'ref',
              ref: 'lex:app.bsky.richtext.facet',
            },
          },
          avatar: {
            type: 'string',
            format: 'uri',
          },
          likeCount: {
            type: 'integer',
            minimum: 0,
          },
          acceptsInteractions: {
            type: 'boolean',
          },
          labels: {
            type: 'array',
            items: {
              type: 'ref',
              ref: 'lex:com.atproto.label.defs#label',
            },
          },
          viewer: {
            type: 'ref',
            ref: 'lex:app.bsky.feed.defs#generatorViewerState',
          },
          contentMode: {
            type: 'string',
            knownValues: [
              'app.bsky.feed.defs#contentModeUnspecified',
              'app.bsky.feed.defs#contentModeVideo',
            ],
          },
          indexedAt: {
            type: 'string',
            format: 'datetime',
          },
        },
      },
      generatorViewerState: {
        type: 'object',
        properties: {
          like: {
            type: 'string',
            format: 'at-uri',
          },
        },
      },
      threadgateView: {
        type: 'object',
        properties: {
          uri: {
            type: 'string',
            format: 'at-uri',
          },
          cid: {
            type: 'string',
            format: 'cid',
          },
          record: {
            type: 'unknown',
          },
          lists: {
            type: 'array',
            items: {
              type: 'ref',
              ref: 'lex:app.bsky.graph.defs#listViewBasic',
            },
          },
        },
      },
      interaction: {
        type: 'object',
        properties: {
          item: {
            type: 'string',
            format: 'at-uri',
          },
          event: {
            type: 'string',
            knownValues: [
              'app.bsky.feed.defs#requestLess',
              'app.bsky.feed.defs#requestMore',
              'app.bsky.feed.defs#clickthroughItem',
              'app.bsky.feed.defs#clickthroughAuthor',
              'app.bsky.feed.defs#clickthroughReposter',
              'app.bsky.feed.defs#clickthroughEmbed',
              'app.bsky.feed.defs#interactionSeen',
              'app.bsky.feed.defs#interactionLike',
              'app.bsky.feed.defs#interactionRepost',
              'app.bsky.feed.defs#interactionReply',
              'app.bsky.feed.defs#interactionQuote',
              'app.bsky.feed.defs#interactionShare',
            ],
          },
          feedContext: {
            type: 'string',
            description:
              'Context on a feed item that was originally supplied by the feed generator on getFeedSkeleton.',
            maxLength: 2000,
          },
        },
      },
      requestLess: {
        type: 'token',
        description:
          'Request that less content like the given feed item be shown in the feed',
      },
      requestMore: {
        type: 'token',
        description:
          'Request that more content like the given feed item be shown in the feed',
      },
      clickthroughItem: {
        type: 'token',
        description: 'User clicked through to the feed item',
      },
      clickthroughAuthor: {
        type: 'token',
        description: 'User clicked through to the author of the feed item',
      },
      clickthroughReposter: {
        type: 'token',
        description: 'User clicked through to the reposter of the feed item',
      },
      clickthroughEmbed: {
        type: 'token',
        description:
          'User clicked through to the embedded content of the feed item',
      },
      contentModeUnspecified: {
        type: 'token',
        description: 'Declares the feed generator returns any types of posts.',
      },
      contentModeVideo: {
        type: 'token',
        description:
          'Declares the feed generator returns posts containing app.bsky.embed.video embeds.',
      },
      interactionSeen: {
        type: 'token',
        description: 'Feed item was seen by user',
      },
      interactionLike: {
        type: 'token',
        description: 'User liked the feed item',
      },
      interactionRepost: {
        type: 'token',
        description: 'User reposted the feed item',
      },
      interactionReply: {
        type: 'token',
        description: 'User replied to the feed item',
      },
      interactionQuote: {
        type: 'token',
        description: 'User quoted the feed item',
      },
      interactionShare: {
        type: 'token',
        description: 'User shared the feed item',
      },
    },
  },
  AppBskyFeedPost: {
    lexicon: 1,
    id: 'app.bsky.feed.post',
    defs: {
      main: {
        type: 'record',
        description: 'Record containing a Bluesky post.',
        key: 'tid',
        record: {
          type: 'object',
          required: ['text', 'createdAt'],
          properties: {
            text: {
              type: 'string',
              maxLength: 3000,
              maxGraphemes: 300,
              description:
                'The primary post content. May be an empty string, if there are embeds.',
            },
            entities: {
              type: 'array',
              description: 'DEPRECATED: replaced by app.bsky.richtext.facet.',
              items: {
                type: 'ref',
                ref: 'lex:app.bsky.feed.post#entity',
              },
            },
            facets: {
              type: 'array',
              description:
                'Annotations of text (mentions, URLs, hashtags, etc)',
              items: {
                type: 'ref',
                ref: 'lex:app.bsky.richtext.facet',
              },
            },
            reply: {
              type: 'ref',
              ref: 'lex:app.bsky.feed.post#replyRef',
            },
            embed: {
              type: 'union',
              refs: [
                'lex:app.bsky.embed.images',
                'lex:app.bsky.embed.video',
                'lex:app.bsky.embed.external',
                'lex:app.bsky.embed.record',
                'lex:app.bsky.embed.recordWithMedia',
                'lex:ar.cabildoabierto.embed.selectionQuote',
                'lex:ar.cabildoabierto.embed.visualization',
              ],
            },
            langs: {
              type: 'array',
              description:
                'Indicates human language of post primary text content.',
              maxLength: 3,
              items: {
                type: 'string',
                format: 'language',
              },
            },
            labels: {
              type: 'union',
              description:
                'Self-label values for this post. Effectively content warnings.',
              refs: ['lex:com.atproto.label.defs#selfLabels'],
            },
            tags: {
              type: 'array',
              description:
                'Additional hashtags, in addition to any included in post text and facets.',
              maxLength: 8,
              items: {
                type: 'string',
                maxLength: 640,
                maxGraphemes: 64,
              },
            },
            createdAt: {
              type: 'string',
              format: 'datetime',
              description:
                'Client-declared timestamp when this post was originally created.',
            },
          },
        },
      },
      replyRef: {
        type: 'object',
        required: ['root', 'parent'],
        properties: {
          root: {
            type: 'ref',
            ref: 'lex:com.atproto.repo.strongRef',
          },
          parent: {
            type: 'ref',
            ref: 'lex:com.atproto.repo.strongRef',
          },
        },
      },
      entity: {
        type: 'object',
        description: 'Deprecated: use facets instead.',
        required: ['index', 'type', 'value'],
        properties: {
          index: {
            type: 'ref',
            ref: 'lex:app.bsky.feed.post#textSlice',
          },
          type: {
            type: 'string',
            description: "Expected values are 'mention' and 'link'.",
          },
          value: {
            type: 'string',
          },
        },
      },
      textSlice: {
        type: 'object',
        description:
          'Deprecated. Use app.bsky.richtext instead -- A text segment. Start is inclusive, end is exclusive. Indices are for utf16-encoded strings.',
        required: ['start', 'end'],
        properties: {
          start: {
            type: 'integer',
            minimum: 0,
          },
          end: {
            type: 'integer',
            minimum: 0,
          },
        },
      },
    },
  },
  AppBskyGraphDefs: {
    lexicon: 1,
    id: 'app.bsky.graph.defs',
    defs: {
      listViewBasic: {
        type: 'object',
        required: ['uri', 'cid', 'name', 'purpose'],
        properties: {
          uri: {
            type: 'string',
            format: 'at-uri',
          },
          cid: {
            type: 'string',
            format: 'cid',
          },
          name: {
            type: 'string',
            maxLength: 64,
            minLength: 1,
          },
          purpose: {
            type: 'ref',
            ref: 'lex:app.bsky.graph.defs#listPurpose',
          },
          avatar: {
            type: 'string',
            format: 'uri',
          },
          listItemCount: {
            type: 'integer',
            minimum: 0,
          },
          labels: {
            type: 'array',
            items: {
              type: 'ref',
              ref: 'lex:com.atproto.label.defs#label',
            },
          },
          viewer: {
            type: 'ref',
            ref: 'lex:app.bsky.graph.defs#listViewerState',
          },
          indexedAt: {
            type: 'string',
            format: 'datetime',
          },
        },
      },
      listView: {
        type: 'object',
        required: ['uri', 'cid', 'creator', 'name', 'purpose', 'indexedAt'],
        properties: {
          uri: {
            type: 'string',
            format: 'at-uri',
          },
          cid: {
            type: 'string',
            format: 'cid',
          },
          creator: {
            type: 'ref',
            ref: 'lex:app.bsky.actor.defs#profileView',
          },
          name: {
            type: 'string',
            maxLength: 64,
            minLength: 1,
          },
          purpose: {
            type: 'ref',
            ref: 'lex:app.bsky.graph.defs#listPurpose',
          },
          description: {
            type: 'string',
            maxGraphemes: 300,
            maxLength: 3000,
          },
          descriptionFacets: {
            type: 'array',
            items: {
              type: 'ref',
              ref: 'lex:app.bsky.richtext.facet',
            },
          },
          avatar: {
            type: 'string',
            format: 'uri',
          },
          listItemCount: {
            type: 'integer',
            minimum: 0,
          },
          labels: {
            type: 'array',
            items: {
              type: 'ref',
              ref: 'lex:com.atproto.label.defs#label',
            },
          },
          viewer: {
            type: 'ref',
            ref: 'lex:app.bsky.graph.defs#listViewerState',
          },
          indexedAt: {
            type: 'string',
            format: 'datetime',
          },
        },
      },
      listItemView: {
        type: 'object',
        required: ['uri', 'subject'],
        properties: {
          uri: {
            type: 'string',
            format: 'at-uri',
          },
          subject: {
            type: 'ref',
            ref: 'lex:app.bsky.actor.defs#profileView',
          },
        },
      },
      starterPackViewBasic: {
        type: 'object',
        required: ['uri', 'cid', 'record', 'creator', 'indexedAt'],
        properties: {
          uri: {
            type: 'string',
            format: 'at-uri',
          },
          cid: {
            type: 'string',
            format: 'cid',
          },
          record: {
            type: 'unknown',
          },
          creator: {
            type: 'ref',
            ref: 'lex:app.bsky.actor.defs#profileViewBasic',
          },
          listItemCount: {
            type: 'integer',
            minimum: 0,
          },
          joinedWeekCount: {
            type: 'integer',
            minimum: 0,
          },
          joinedAllTimeCount: {
            type: 'integer',
            minimum: 0,
          },
          labels: {
            type: 'array',
            items: {
              type: 'ref',
              ref: 'lex:com.atproto.label.defs#label',
            },
          },
          indexedAt: {
            type: 'string',
            format: 'datetime',
          },
        },
      },
      listPurpose: {
        type: 'string',
        knownValues: [
          'app.bsky.graph.defs#modlist',
          'app.bsky.graph.defs#curatelist',
          'app.bsky.graph.defs#referencelist',
        ],
      },
      modlist: {
        type: 'token',
        description:
          'A list of actors to apply an aggregate moderation action (mute/block) on.',
      },
      curatelist: {
        type: 'token',
        description:
          'A list of actors used for curation purposes such as list feeds or interaction gating.',
      },
      referencelist: {
        type: 'token',
        description:
          'A list of actors used for only for reference purposes such as within a starter pack.',
      },
      listViewerState: {
        type: 'object',
        properties: {
          muted: {
            type: 'boolean',
          },
          blocked: {
            type: 'string',
            format: 'at-uri',
          },
        },
      },
    },
  },
  AppBskyLabelerDefs: {
    lexicon: 1,
    id: 'app.bsky.labeler.defs',
    defs: {
      labelerView: {
        type: 'object',
        required: ['uri', 'cid', 'creator', 'indexedAt'],
        properties: {
          uri: {
            type: 'string',
            format: 'at-uri',
          },
          cid: {
            type: 'string',
            format: 'cid',
          },
          creator: {
            type: 'ref',
            ref: 'lex:app.bsky.actor.defs#profileView',
          },
          likeCount: {
            type: 'integer',
            minimum: 0,
          },
          viewer: {
            type: 'ref',
            ref: 'lex:app.bsky.labeler.defs#labelerViewerState',
          },
          indexedAt: {
            type: 'string',
            format: 'datetime',
          },
          labels: {
            type: 'array',
            items: {
              type: 'ref',
              ref: 'lex:com.atproto.label.defs#label',
            },
          },
        },
      },
      labelerViewerState: {
        type: 'object',
        properties: {
          like: {
            type: 'string',
            format: 'at-uri',
          },
        },
      },
      labelerPolicies: {
        type: 'object',
        required: ['labelValues'],
        properties: {
          labelValues: {
            type: 'array',
            description:
              'The label values which this labeler publishes. May include global or custom labels.',
            items: {
              type: 'ref',
              ref: 'lex:com.atproto.label.defs#labelValue',
            },
          },
          labelValueDefinitions: {
            type: 'array',
            description:
              'Label values created by this labeler and scoped exclusively to it. Labels defined here will override global label definitions for this labeler.',
            items: {
              type: 'ref',
              ref: 'lex:com.atproto.label.defs#labelValueDefinition',
            },
          },
        },
      },
    },
  },
  AppBskyRichtextFacet: {
    lexicon: 1,
    id: 'app.bsky.richtext.facet',
    defs: {
      main: {
        type: 'object',
        description: 'Annotation of a sub-string within rich text.',
        required: ['index', 'features'],
        properties: {
          index: {
            type: 'ref',
            ref: 'lex:app.bsky.richtext.facet#byteSlice',
          },
          features: {
            type: 'array',
            items: {
              type: 'union',
              refs: [
                'lex:app.bsky.richtext.facet#mention',
                'lex:app.bsky.richtext.facet#link',
                'lex:app.bsky.richtext.facet#tag',
              ],
            },
          },
        },
      },
      mention: {
        type: 'object',
        description:
          "Facet feature for mention of another account. The text is usually a handle, including a '@' prefix, but the facet reference is a DID.",
        required: ['did'],
        properties: {
          did: {
            type: 'string',
            format: 'did',
          },
        },
      },
      link: {
        type: 'object',
        description:
          'Facet feature for a URL. The text URL may have been simplified or truncated, but the facet reference should be a complete URL.',
        required: ['uri'],
        properties: {
          uri: {
            type: 'string',
            format: 'uri',
          },
        },
      },
      tag: {
        type: 'object',
        description:
          "Facet feature for a hashtag. The text usually includes a '#' prefix, but the facet reference should not (except in the case of 'double hash tags').",
        required: ['tag'],
        properties: {
          tag: {
            type: 'string',
            maxLength: 640,
            maxGraphemes: 64,
          },
        },
      },
      byteSlice: {
        type: 'object',
        description:
          'Specifies the sub-string range a facet feature applies to. Start index is inclusive, end index is exclusive. Indices are zero-indexed, counting bytes of the UTF-8 encoded text. NOTE: some languages, like Javascript, use UTF-16 or Unicode codepoints for string slice indexing; in these languages, convert to byte arrays before working with facets.',
        required: ['byteStart', 'byteEnd'],
        properties: {
          byteStart: {
            type: 'integer',
            minimum: 0,
          },
          byteEnd: {
            type: 'integer',
            minimum: 0,
          },
        },
      },
    },
  },
  ArCabildoabiertoActorCaProfile: {
    lexicon: 1,
    id: 'ar.cabildoabierto.actor.caProfile',
    defs: {
      main: {
        type: 'record',
        description: 'Un perfil de Cabildo Abierto.',
        key: 'literal:self',
        record: {
          type: 'object',
          properties: {
            createdAt: {
              type: 'string',
              format: 'datetime',
            },
            displayName: {
              type: 'string',
              maxGraphemes: 64,
              maxLength: 640,
            },
            description: {
              type: 'string',
              maxGraphemes: 256,
              maxLength: 2560,
            },
            avatar: {
              type: 'blob',
              description: 'Foto de perfil.',
              accept: ['image/png', 'image/jpeg'],
              maxSize: 1000000,
            },
          },
        },
      },
    },
  },
  ArCabildoabiertoActorDefs: {
    lexicon: 1,
    id: 'ar.cabildoabierto.actor.defs',
    defs: {
      profileViewBasic: {
        type: 'object',
        required: ['did', 'handle'],
        properties: {
          did: {
            type: 'string',
            format: 'did',
          },
          handle: {
            type: 'string',
            format: 'handle',
          },
          displayName: {
            type: 'string',
            maxGraphemes: 64,
            maxLength: 640,
          },
          avatar: {
            type: 'string',
            format: 'uri',
          },
          createdAt: {
            type: 'string',
            format: 'datetime',
          },
          caProfile: {
            type: 'string',
            format: 'at-uri',
          },
          verification: {
            type: 'string',
            knownValues: ['person', 'org'],
          },
          description: {
            type: 'string',
            maxGraphemes: 256,
            maxLength: 2560,
          },
        },
      },
      profileViewDetailed: {
        type: 'object',
        required: ['did', 'handle'],
        properties: {
          did: {
            type: 'string',
            format: 'did',
          },
          handle: {
            type: 'string',
            format: 'handle',
          },
          displayName: {
            type: 'string',
            maxGraphemes: 64,
            maxLength: 640,
          },
          description: {
            type: 'string',
            maxGraphemes: 256,
            maxLength: 2560,
          },
          avatar: {
            type: 'string',
            format: 'uri',
          },
          consensusCount: {
            type: 'integer',
          },
          commentsCount: {
            type: 'integer',
          },
          editsCount: {
            type: 'integer',
          },
          indexedAt: {
            type: 'string',
            format: 'datetime',
          },
          createdAt: {
            type: 'string',
            format: 'datetime',
          },
          caProfile: {
            type: 'string',
            format: 'at-uri',
          },
          verification: {
            type: 'string',
            knownValues: ['person', 'org'],
          },
        },
      },
    },
  },
  ArCabildoabiertoDataDataset: {
    lexicon: 1,
    id: 'ar.cabildoabierto.data.dataset',
    defs: {
      main: {
        type: 'record',
        key: 'tid',
        record: {
          type: 'object',
          required: ['name', 'createdAt', 'columns'],
          properties: {
            name: {
              type: 'string',
              minLength: 1,
              maxLength: 120,
            },
            description: {
              type: 'string',
            },
            createdAt: {
              type: 'string',
              format: 'datetime',
              description:
                'Client-declared timestamp when this post was originally created.',
            },
            format: {
              type: 'string',
              description:
                'Una declaración del formato en el que se encuentran los datos. Por defecto, json.',
              knownValues: ['json', 'csv'],
            },
            columns: {
              type: 'array',
              items: {
                type: 'ref',
                ref: 'lex:ar.cabildoabierto.data.dataset#column',
              },
              minLength: 1,
            },
            blob: {
              type: 'blob',
            },
            url: {
              type: 'string',
            },
          },
        },
      },
      column: {
        type: 'object',
        required: ['name'],
        properties: {
          name: {
            type: 'string',
            minLength: 1,
            maxLength: 120,
          },
        },
      },
      datasetViewBasic: {
        type: 'object',
        required: ['name', 'uri', 'cid', 'author', 'createdAt', 'columns'],
        properties: {
          name: {
            type: 'string',
          },
          uri: {
            type: 'string',
            format: 'at-uri',
          },
          cid: {
            type: 'string',
            format: 'cid',
          },
          author: {
            type: 'ref',
            ref: 'lex:ar.cabildoabierto.actor.defs#profileViewBasic',
          },
          createdAt: {
            type: 'string',
            format: 'datetime',
            description:
              'Client-declared timestamp when this post was originally created.',
          },
          description: {
            type: 'string',
            maxLength: 3000,
            maxGraphemes: 300,
          },
          columns: {
            type: 'array',
            items: {
              type: 'ref',
              ref: 'lex:ar.cabildoabierto.data.dataset#column',
            },
            minLength: 1,
          },
          editedAt: {
            type: 'string',
            format: 'datetime',
          },
        },
      },
      datasetView: {
        type: 'object',
        required: [
          'name',
          'uri',
          'cid',
          'author',
          'createdAt',
          'columns',
          'data',
        ],
        properties: {
          name: {
            type: 'string',
          },
          uri: {
            type: 'string',
            format: 'at-uri',
          },
          cid: {
            type: 'string',
            format: 'cid',
          },
          author: {
            type: 'ref',
            ref: 'lex:ar.cabildoabierto.actor.defs#profileViewBasic',
          },
          createdAt: {
            type: 'string',
            format: 'datetime',
            description:
              'Client-declared timestamp when this post was originally created.',
          },
          description: {
            type: 'string',
            maxLength: 3000,
            maxGraphemes: 300,
          },
          columns: {
            type: 'array',
            items: {
              type: 'ref',
              ref: 'lex:ar.cabildoabierto.data.dataset#column',
            },
            minLength: 1,
          },
          data: {
            type: 'string',
          },
          dataFormat: {
            type: 'string',
          },
          editedAt: {
            type: 'string',
            format: 'datetime',
          },
        },
      },
      topicsDatasetView: {
        type: 'object',
        required: ['columns', 'data'],
        properties: {
          columns: {
            type: 'array',
            items: {
              type: 'ref',
              ref: 'lex:ar.cabildoabierto.data.dataset#column',
            },
            minLength: 1,
          },
          data: {
            type: 'string',
          },
          dataFormat: {
            type: 'string',
          },
        },
      },
    },
  },
  ArCabildoabiertoDataDocument: {
    lexicon: 1,
    id: 'ar.cabildoabierto.data.document',
    defs: {
      main: {
        type: 'record',
        key: 'tid',
        record: {
          type: 'object',
          required: ['name', 'createdAt'],
          properties: {
            name: {
              type: 'string',
              minLength: 1,
              maxLength: 120,
            },
            description: {
              type: 'string',
            },
            createdAt: {
              type: 'string',
              format: 'datetime',
              description:
                'Client-declared timestamp when this post was originally created.',
            },
            blob: {
              type: 'blob',
            },
            url: {
              type: 'string',
            },
            format: {
              type: 'string',
            },
          },
        },
      },
    },
  },
  ArCabildoabiertoEmbedPoll: {
    lexicon: 1,
    id: 'ar.cabildoabierto.embed.poll',
    defs: {
      main: {
        type: 'object',
        required: ['key', 'poll'],
        properties: {
          key: {
            type: 'string',
            description:
              'Unique identifier of the poll within its container, obtained as a hash of the poll object.',
          },
          poll: {
            type: 'ref',
            ref: 'lex:ar.cabildoabierto.embed.poll#poll',
          },
        },
      },
      poll: {
        type: 'object',
        required: ['choices'],
        properties: {
          description: {
            type: 'string',
          },
          choices: {
            type: 'array',
            items: {
              type: 'ref',
              ref: 'lex:ar.cabildoabierto.embed.poll#pollChoice',
            },
          },
          createdAt: {
            type: 'string',
            format: 'datetime',
          },
          closeDate: {
            type: 'string',
            format: 'datetime',
          },
        },
      },
      pollChoice: {
        type: 'object',
        required: ['label'],
        properties: {
          label: {
            type: 'string',
          },
        },
      },
      view: {
        type: 'object',
        required: ['key', 'poll', 'votes'],
        properties: {
          key: {
            type: 'string',
          },
          poll: {
            type: 'ref',
            ref: 'lex:ar.cabildoabierto.embed.poll#poll',
          },
          viewer: {
            type: 'ref',
            ref: 'lex:ar.cabildoabierto.embed.poll#pollViewer',
          },
          votes: {
            type: 'array',
            items: {
              type: 'integer',
            },
          },
          createdAt: {
            type: 'string',
            format: 'datetime',
          },
          closeDate: {
            type: 'string',
            format: 'datetime',
          },
        },
      },
      pollViewer: {
        type: 'object',
        required: [],
        properties: {
          choice: {
            type: 'string',
          },
          voteUri: {
            type: 'string',
            format: 'uri',
          },
        },
      },
    },
  },
  ArCabildoabiertoEmbedPollVote: {
    lexicon: 1,
    id: 'ar.cabildoabierto.embed.pollVote',
    defs: {
      main: {
        type: 'record',
        key: 'tid',
        record: {
          type: 'object',
          required: ['subjectId', 'subjectPoll', 'choice', 'createdAt'],
          properties: {
            subjectId: {
              type: 'string',
              description:
                'The id of the poll that was voted on. It can be either at://[did]/[collection]/[rkey]/[poll-key] or ca://[topicId]/[poll-key]',
            },
            subjectPoll: {
              type: 'ref',
              ref: 'lex:ar.cabildoabierto.embed.poll#poll',
              description:
                'A copy of the poll that was voted on. The hash of this object should match the id.',
            },
            choice: {
              type: 'string',
              description: 'The label of the choice that was voted for.',
            },
            createdAt: {
              type: 'string',
              format: 'datetime',
            },
          },
        },
      },
      view: {
        type: 'object',
        required: ['author', 'choice'],
        properties: {
          author: {
            type: 'ref',
            ref: 'lex:ar.cabildoabierto.actor.defs#profileViewBasic',
          },
          choice: {
            type: 'string',
          },
        },
      },
    },
  },
  ArCabildoabiertoEmbedSelectionQuote: {
    lexicon: 1,
    id: 'ar.cabildoabierto.embed.selectionQuote',
    description:
      'A quote of a text selection in a record. Start is inclusive, end is exclusive',
    defs: {
      main: {
        type: 'object',
        required: ['start', 'end'],
        properties: {
          start: {
            type: 'integer',
          },
          end: {
            type: 'integer',
          },
        },
      },
      view: {
        type: 'object',
        required: [
          'start',
          'end',
          'quotedText',
          'quotedContent',
          'quotedContentAuthor',
        ],
        properties: {
          start: {
            type: 'integer',
          },
          end: {
            type: 'integer',
          },
          quotedText: {
            type: 'string',
          },
          quotedTextFormat: {
            type: 'string',
          },
          quotedContent: {
            type: 'string',
            format: 'at-uri',
          },
          quotedContentEmbeds: {
            type: 'array',
            items: {
              type: 'ref',
              ref: 'lex:ar.cabildoabierto.wiki.embed#view',
            },
          },
          quotedContentAuthor: {
            type: 'ref',
            ref: 'lex:ar.cabildoabierto.actor.defs#profileViewBasic',
          },
          quotedContentTitle: {
            type: 'string',
          },
        },
      },
    },
  },
  ArCabildoabiertoEmbedVisualization: {
    lexicon: 1,
    id: 'ar.cabildoabierto.embed.visualization',
    defs: {
      main: {
        type: 'object',
        required: ['dataSource', 'spec'],
        properties: {
          dataSource: {
            type: 'union',
            refs: [
              'lex:ar.cabildoabierto.embed.visualization#datasetDataSource',
              'lex:ar.cabildoabierto.embed.visualization#topicsDataSource',
            ],
          },
          filters: {
            type: 'array',
            items: {
              type: 'union',
              refs: ['lex:ar.cabildoabierto.embed.visualization#columnFilter'],
            },
          },
          spec: {
            type: 'union',
            refs: [
              'lex:ar.cabildoabierto.embed.visualization#hemicycle',
              'lex:ar.cabildoabierto.embed.visualization#twoAxisPlot',
              'lex:ar.cabildoabierto.embed.visualization#oneAxisPlot',
              'lex:ar.cabildoabierto.embed.visualization#table',
              'lex:ar.cabildoabierto.embed.visualization#eleccion',
            ],
          },
          title: {
            type: 'string',
          },
          caption: {
            type: 'string',
          },
          aspectRatio: {
            type: 'string',
            description:
              'Un número de punto flotante que determina la proporción del ancho sobre el alto.',
          },
        },
      },
      datasetDataSource: {
        type: 'object',
        required: ['dataset'],
        properties: {
          dataset: {
            type: 'string',
            format: 'at-uri',
          },
        },
      },
      topicsDataSource: {
        type: 'object',
        properties: {},
      },
      columnFilter: {
        type: 'object',
        required: ['column', 'operator'],
        properties: {
          column: {
            type: 'string',
          },
          operator: {
            type: 'string',
          },
          operands: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
      },
      hemicycle: {
        type: 'object',
        properties: {},
      },
      table: {
        type: 'object',
        properties: {
          columns: {
            type: 'array',
            items: {
              type: 'ref',
              ref: 'lex:ar.cabildoabierto.embed.visualization#tableVisualizationColumn',
            },
            description:
              'Se puede usar para mostrar solo algunas de las columnas y para opcionalmente renombrar algunas.',
          },
        },
      },
      tableVisualizationColumn: {
        type: 'object',
        required: ['columnName'],
        properties: {
          columnName: {
            type: 'string',
          },
          alias: {
            type: 'string',
          },
          precision: {
            type: 'integer',
          },
        },
      },
      twoAxisPlot: {
        type: 'object',
        required: ['xAxis', 'plot'],
        properties: {
          xAxis: {
            type: 'string',
          },
          xLabel: {
            type: 'string',
          },
          yAxis: {
            type: 'string',
          },
          yLabel: {
            type: 'string',
          },
          dimensions: {
            type: 'ref',
            ref: 'lex:ar.cabildoabierto.embed.visualization#plotDimensions',
          },
          plot: {
            type: 'union',
            refs: [
              'lex:ar.cabildoabierto.embed.visualization#barplot',
              'lex:ar.cabildoabierto.embed.visualization#lines',
              'lex:ar.cabildoabierto.embed.visualization#scatterplot',
            ],
          },
          yAxes: {
            type: 'array',
            items: {
              type: 'ref',
              ref: 'lex:ar.cabildoabierto.embed.visualization#axisConfig',
            },
          },
          colors: {
            type: 'array',
            items: {
              type: 'ref',
              ref: 'lex:ar.cabildoabierto.embed.visualization#axisConfig',
            },
            maxLength: 1,
          },
        },
      },
      axisConfig: {
        type: 'object',
        properties: {
          column: {
            type: 'string',
          },
          label: {
            type: 'string',
          },
        },
      },
      oneAxisPlot: {
        type: 'object',
        required: ['xAxis', 'plot'],
        properties: {
          xAxis: {
            type: 'string',
          },
          xLabel: {
            type: 'string',
          },
          dimensions: {
            type: 'ref',
            ref: 'lex:ar.cabildoabierto.embed.visualization#plotDimensions',
          },
          plot: {
            type: 'union',
            refs: ['lex:ar.cabildoabierto.embed.visualization#histogram'],
          },
        },
      },
      plotDimensions: {
        type: 'object',
        properties: {
          xTickLabelsAngle: {
            type: 'integer',
            description:
              'El ángulo de las etiquetas del eje x. 0 es horizontal y aumenta en sentido antihorario (0-360).',
          },
          xLabelFontSize: {
            type: 'integer',
          },
          xTickLabelsFontSize: {
            type: 'integer',
          },
          xTicksCount: {
            type: 'integer',
          },
          xLabelOffset: {
            type: 'integer',
          },
          xAxisPrecision: {
            type: 'integer',
          },
          yTicksCount: {
            type: 'integer',
          },
          yLabelOffset: {
            type: 'integer',
          },
          yLabelFontSize: {
            type: 'integer',
          },
          yTickLabelsFontSize: {
            type: 'integer',
          },
          yAxisPrecision: {
            type: 'integer',
          },
          marginBottom: {
            type: 'integer',
          },
          marginLeft: {
            type: 'integer',
          },
        },
      },
      histogram: {
        type: 'object',
        properties: {},
      },
      lines: {
        type: 'object',
        properties: {},
      },
      scatterplot: {
        type: 'object',
        properties: {},
      },
      barplot: {
        type: 'object',
        properties: {},
      },
      eleccion: {
        type: 'object',
        properties: {
          tipoDeEleccion: {
            type: 'string',
            description: 'Legislativa o Ejecutiva',
          },
          region: {
            type: 'string',
            description:
              "Nombre de la provincia en el caso de ser una elección provincial y 'Nacional' en caso contrario.",
          },
          columnaTopicIdDistrito: {
            type: 'string',
            description:
              'Columna con el identificador del tema de la wiki sobre el distrito del candidato.',
          },
          columnaNombreCandidato: {
            type: 'string',
            description: 'Columna con el nombre del candidato.',
          },
          columnaTopicIdCandidato: {
            type: 'string',
            description:
              'Columna con el identificador del tema de la wiki sobre el candidato.',
          },
          columnaDistritoCandidato: {
            type: 'string',
            description:
              'Columna usada como distrito en el cual se postula el candidato.',
          },
          columnaGeneroCandidato: {
            type: 'string',
            description: 'Columna usada como género del candidato.',
          },
          columnaAlianza: {
            type: 'string',
            description:
              'Columna usada como alianza por la cual se postula el candidato.',
          },
          columnaTopicIdAlianza: {
            type: 'string',
            description:
              'Columna con el identificador del tema de la wiki sobre la alianza.',
          },
          columnaPosicion: {
            type: 'string',
            description:
              'Columna que indica la posición del candidato en la lista.',
          },
          columnaSubcargo: {
            type: 'string',
            description:
              'Columna que indica si la postulación es como titular o suplente.',
          },
          columnaAnioNacimiento: {
            type: 'string',
            description:
              'Columna que indica el año de nacimiento del candidato.',
          },
          columnaCargo: {
            type: 'string',
            description: 'Columna que indica el cargo (Diputado o Senador)',
          },
        },
      },
      view: {
        type: 'object',
        required: ['visualization', 'dataset'],
        properties: {
          visualization: {
            type: 'ref',
            ref: 'lex:ar.cabildoabierto.embed.visualization',
          },
          dataset: {
            type: 'union',
            refs: [
              'lex:ar.cabildoabierto.data.dataset#datasetView',
              'lex:ar.cabildoabierto.data.dataset#topicsDatasetView',
            ],
          },
        },
      },
    },
  },
  ArCabildoabiertoNotificationListNotifications: {
    lexicon: 1,
    id: 'ar.cabildoabierto.notification.listNotifications',
    defs: {
      main: {
        type: 'query',
        description:
          'Enumerate notifications for the requesting account. Requires auth.',
        parameters: {
          type: 'params',
          properties: {
            reasons: {
              description: 'Notification reasons to include in response.',
              type: 'array',
              items: {
                type: 'string',
                description:
                  'A reason that matches the reason property of #notification.',
              },
            },
            limit: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              default: 50,
            },
            priority: {
              type: 'boolean',
            },
            cursor: {
              type: 'string',
            },
            seenAt: {
              type: 'string',
              format: 'datetime',
            },
          },
        },
        output: {
          encoding: 'application/json',
          schema: {
            type: 'object',
            required: ['notifications'],
            properties: {
              cursor: {
                type: 'string',
              },
              notifications: {
                type: 'array',
                items: {
                  type: 'ref',
                  ref: 'lex:ar.cabildoabierto.notification.listNotifications#notification',
                },
              },
              priority: {
                type: 'boolean',
              },
              seenAt: {
                type: 'string',
                format: 'datetime',
              },
            },
          },
        },
      },
      notification: {
        type: 'object',
        required: [
          'uri',
          'cid',
          'author',
          'reason',
          'record',
          'isRead',
          'indexedAt',
        ],
        properties: {
          uri: {
            type: 'string',
            format: 'at-uri',
          },
          cid: {
            type: 'string',
            format: 'cid',
          },
          author: {
            type: 'ref',
            ref: 'lex:ar.cabildoabierto.actor.defs#profileViewBasic',
          },
          reason: {
            type: 'string',
            description:
              "Expected values are 'like', 'repost', 'follow', 'mention', 'reply', 'quote', and 'starterpack-joined'.",
            knownValues: [
              'like',
              'repost',
              'follow',
              'mention',
              'reply',
              'quote',
              'starterpack-joined',
              'topic-edit',
              'topic-version-vote',
            ],
          },
          reasonSubject: {
            type: 'string',
          },
          reasonSubjectContext: {
            type: 'string',
          },
          record: {
            type: 'unknown',
          },
          isRead: {
            type: 'boolean',
          },
          indexedAt: {
            type: 'string',
            format: 'datetime',
          },
          labels: {
            type: 'array',
            items: {
              type: 'ref',
              ref: 'lex:com.atproto.label.defs#label',
            },
          },
        },
      },
    },
  },
  ArCabildoabiertoWikiComment: {
    lexicon: 1,
    id: 'ar.cabildoabierto.wiki.comment',
    defs: {
      main: {
        type: 'record',
        description: 'Un registro que contiene un comentario en un tema.',
        key: 'tid',
        record: {
          type: 'object',
          required: ['text', 'createdAt'],
          properties: {
            text: {
              type: 'string',
            },
            facets: {
              type: 'array',
              description: 'Menciones y urls en el formato de Bluesky.',
              items: {
                type: 'ref',
                ref: 'lex:app.bsky.richtext.facet',
              },
            },
            embeds: {
              type: 'array',
              items: {
                type: 'ref',
                ref: 'lex:ar.cabildoabierto.wiki.embed',
              },
            },
            reply: {
              type: 'ref',
              ref: 'lex:ar.cabildoabierto.wiki.comment#replyRef',
            },
            createdAt: {
              type: 'string',
              format: 'datetime',
              description:
                'Fecha de creación del comentario declarada por el autor.',
            },
            isChallenge: {
              type: 'boolean',
            },
          },
        },
      },
      replyRef: {
        type: 'object',
        required: ['root', 'parent'],
        properties: {
          root: {
            type: 'ref',
            ref: 'lex:com.atproto.repo.strongRef',
          },
          parent: {
            type: 'ref',
            ref: 'lex:com.atproto.repo.strongRef',
          },
        },
      },
      view: {
        type: 'object',
        required: [],
        properties: {
          text: {
            type: 'string',
          },
          facets: {
            type: 'array',
            description: 'Menciones y urls en el formato de Bluesky.',
            items: {
              type: 'ref',
              ref: 'lex:app.bsky.richtext.facet',
            },
          },
          embeds: {
            type: 'array',
            items: {
              type: 'ref',
              ref: 'lex:ar.cabildoabierto.wiki.embed#view',
            },
          },
          reply: {
            type: 'ref',
            ref: 'lex:ar.cabildoabierto.wiki.comment#replyRef',
          },
          createdAt: {
            type: 'string',
            format: 'datetime',
            description:
              'Fecha de creación del comentario declarada por el autor.',
          },
          replyCount: {
            type: 'integer',
          },
          upvoteCount: {
            type: 'integer',
          },
          downvoteCount: {
            type: 'integer',
          },
          quoteCount: {
            type: 'integer',
          },
          rootCreationDate: {
            type: 'string',
            format: 'datetime',
          },
          voteContext: {
            type: 'ref',
            ref: 'lex:ar.cabildoabierto.wiki.comment#voteContext',
            description:
              'Si el usuario votó a favor o encontra de esta versión y si es una justificación de voto',
          },
          isChallenge: {
            type: 'boolean',
          },
        },
      },
      voteContext: {
        type: 'object',
        required: ['authorVotingState'],
        properties: {
          authorVotingState: {
            type: 'string',
            knownValues: ['accept', 'reject', 'none'],
          },
          vote: {
            type: 'ref',
            ref: 'lex:ar.cabildoabierto.wiki.comment#voteInContext',
          },
        },
      },
      voteInContext: {
        type: 'object',
        required: ['uri', 'subject', 'subjectCreatedAt'],
        properties: {
          uri: {
            type: 'string',
            format: 'uri',
          },
          subject: {
            type: 'string',
            format: 'uri',
          },
          subjectCreatedAt: {
            type: 'string',
            format: 'datetime',
          },
        },
      },
    },
  },
  ArCabildoabiertoWikiConsensus: {
    lexicon: 1,
    id: 'ar.cabildoabierto.wiki.consensus',
    defs: {
      main: {
        type: 'record',
        description:
          'Un registro que contiene una propuesta de consenso en un tema.',
        key: 'tid',
        record: {
          type: 'object',
          required: ['title', 'body', 'topicId', 'consensusId', 'createdAt'],
          properties: {
            topicId: {
              type: 'string',
            },
            consensusId: {
              type: 'string',
            },
            title: {
              type: 'string',
              maxLength: 140,
            },
            body: {
              type: 'string',
            },
            facets: {
              type: 'array',
              description: 'Menciones y urls en el formato de Bluesky.',
              items: {
                type: 'ref',
                ref: 'lex:app.bsky.richtext.facet',
              },
            },
            embeds: {
              type: 'array',
              items: {
                type: 'ref',
                ref: 'lex:ar.cabildoabierto.wiki.embed',
              },
            },
            createdAt: {
              type: 'string',
              format: 'datetime',
              description:
                'Fecha de creación del comentario declarada por el autor.',
            },
            labels: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
            eventDate: {
              type: 'string',
              format: 'datetime',
              description:
                'Fecha a la cual se asocia el consenso cuando describe un evento.',
            },
          },
        },
      },
      replyRef: {
        type: 'object',
        required: ['root', 'parent'],
        properties: {
          root: {
            type: 'ref',
            ref: 'lex:com.atproto.repo.strongRef',
          },
          parent: {
            type: 'ref',
            ref: 'lex:com.atproto.repo.strongRef',
          },
        },
      },
    },
  },
  ArCabildoabiertoWikiDefs: {
    lexicon: 1,
    id: 'ar.cabildoabierto.wiki.defs',
    defs: {
      voteView: {
        type: 'object',
        required: ['uri', 'cid', 'author', 'subject'],
        properties: {
          uri: {
            type: 'string',
            format: 'uri',
          },
          cid: {
            type: 'string',
            format: 'cid',
          },
          author: {
            type: 'ref',
            ref: 'lex:ar.cabildoabierto.actor.defs#profileViewBasic',
          },
          subject: {
            type: 'ref',
            ref: 'lex:com.atproto.repo.strongRef',
          },
        },
      },
      threadViewContent: {
        type: 'object',
        required: ['content'],
        properties: {
          content: {
            type: 'union',
            refs: [
              'lex:ar.cabildoabierto.wiki.comment#view',
              'lex:app.bsky.feed.defs#notFoundPost',
              'lex:app.bsky.feed.defs#blockedPost',
            ],
          },
          parent: {
            type: 'union',
            refs: [
              'lex:ar.cabildoabierto.wiki.defs#threadViewContent',
              'lex:app.bsky.feed.defs#notFoundPost',
              'lex:app.bsky.feed.defs#blockedPost',
            ],
          },
          replies: {
            type: 'array',
            items: {
              type: 'union',
              refs: [
                'lex:ar.cabildoabierto.wiki.defs#threadViewContent',
                'lex:app.bsky.feed.defs#notFoundPost',
                'lex:app.bsky.feed.defs#blockedPost',
              ],
            },
          },
        },
      },
    },
  },
  ArCabildoabiertoWikiEmbed: {
    lexicon: 1,
    id: 'ar.cabildoabierto.wiki.embed',
    defs: {
      main: {
        type: 'object',
        required: ['value', 'index'],
        properties: {
          value: {
            type: 'union',
            refs: [
              'lex:ar.cabildoabierto.embed.visualization',
              'lex:app.bsky.embed.images',
              'lex:ar.cabildoabierto.embed.poll',
            ],
          },
          index: {
            type: 'integer',
          },
        },
      },
      view: {
        type: 'object',
        required: ['value', 'index'],
        properties: {
          value: {
            type: 'union',
            refs: [
              'lex:ar.cabildoabierto.embed.visualization',
              'lex:ar.cabildoabierto.embed.visualization#view',
              'lex:app.bsky.embed.images#view',
              'lex:ar.cabildoabierto.embed.poll',
              'lex:ar.cabildoabierto.embed.poll#view',
            ],
          },
          index: {
            type: 'integer',
          },
        },
      },
    },
  },
  ArCabildoabiertoWikiTopic: {
    lexicon: 1,
    id: 'ar.cabildoabierto.wiki.topic',
    defs: {
      main: {
        type: 'record',
        key: 'tid',
        record: {
          type: 'object',
          required: ['id', 'createdAt'],
          properties: {
            id: {
              type: 'string',
              minLength: 2,
              maxLength: 120,
            },
            props: {
              type: 'array',
              items: {
                type: 'ref',
                ref: 'lex:ar.cabildoabierto.wiki.topic#topicProp',
              },
            },
            createdAt: {
              type: 'string',
              format: 'datetime',
            },
          },
        },
      },
      topicView: {
        type: 'object',
        required: ['id', 'createdAt', 'lastEdit', 'uri', 'cid'],
        properties: {
          id: {
            type: 'string',
            minLength: 2,
            maxLength: 120,
          },
          uri: {
            type: 'string',
            format: 'at-uri',
          },
          cid: {
            type: 'string',
            format: 'cid',
          },
          currentVersion: {
            type: 'string',
            format: 'at-uri',
          },
          record: {
            type: 'unknown',
          },
          props: {
            type: 'array',
            items: {
              type: 'ref',
              ref: 'lex:ar.cabildoabierto.wiki.topic#topicProp',
            },
          },
          lastEdit: {
            type: 'string',
            format: 'datetime',
          },
          createdAt: {
            type: 'string',
            format: 'datetime',
          },
          status: {
            type: 'ref',
            ref: 'lex:ar.cabildoabierto.wiki.topic#topicVersionStatus',
          },
          author: {
            type: 'ref',
            ref: 'lex:ar.cabildoabierto.actor.defs#profileViewBasic',
          },
          viewer: {
            type: 'ref',
            ref: 'lex:ar.cabildoabierto.wiki.topic#topicVersionViewerState',
          },
          replyCount: {
            type: 'integer',
          },
        },
      },
      topicHistory: {
        type: 'object',
        required: ['id', 'versions'],
        properties: {
          id: {
            type: 'string',
            minLength: 2,
            maxLength: 120,
          },
          versions: {
            type: 'array',
            items: {
              type: 'ref',
              ref: 'lex:ar.cabildoabierto.wiki.topic#versionInHistory',
            },
          },
          protection: {
            type: 'string',
          },
        },
      },
      versionInHistory: {
        type: 'object',
        required: ['uri', 'cid', 'createdAt', 'author', 'status'],
        properties: {
          uri: {
            type: 'string',
            format: 'at-uri',
          },
          cid: {
            type: 'string',
            format: 'cid',
          },
          createdAt: {
            type: 'string',
            format: 'datetime',
          },
          author: {
            type: 'ref',
            ref: 'lex:ar.cabildoabierto.actor.defs#profileViewBasic',
          },
          message: {
            type: 'string',
          },
          viewer: {
            type: 'ref',
            ref: 'lex:ar.cabildoabierto.wiki.topic#topicVersionViewerState',
          },
          status: {
            type: 'ref',
            ref: 'lex:ar.cabildoabierto.wiki.topic#topicVersionStatus',
          },
          addedChars: {
            type: 'integer',
          },
          removedChars: {
            type: 'integer',
          },
          prevAccepted: {
            type: 'string',
            format: 'at-uri',
          },
          contribution: {
            type: 'ref',
            ref: 'lex:ar.cabildoabierto.wiki.topic#topicVersionContribution',
          },
          props: {
            type: 'array',
            items: {
              type: 'ref',
              ref: 'lex:ar.cabildoabierto.wiki.topic#topicProp',
            },
          },
          claimsAuthorship: {
            type: 'boolean',
          },
          replyCount: {
            type: 'integer',
          },
        },
      },
      topicVersionViewerState: {
        type: 'object',
        required: [],
        properties: {
          accept: {
            type: 'string',
            format: 'at-uri',
          },
          reject: {
            type: 'string',
            format: 'at-uri',
          },
        },
      },
      topicVersionStatus: {
        type: 'object',
        required: ['isCurrentVersion'],
        properties: {
          acceptVotes: {
            type: 'integer',
          },
          rejectVotes: {
            type: 'integer',
          },
          isCurrentVersion: {
            type: 'boolean',
          },
        },
      },
      topicProp: {
        type: 'object',
        required: ['name', 'value'],
        properties: {
          name: {
            type: 'string',
            maxLength: 50,
          },
          value: {
            type: 'union',
            refs: [
              'lex:ar.cabildoabierto.wiki.topic#stringProp',
              'lex:ar.cabildoabierto.wiki.topic#stringListProp',
              'lex:ar.cabildoabierto.wiki.topic#dateProp',
              'lex:ar.cabildoabierto.wiki.topic#numberProp',
              'lex:ar.cabildoabierto.wiki.topic#booleanProp',
            ],
          },
        },
      },
      stringProp: {
        type: 'object',
        required: ['value'],
        properties: {
          value: {
            type: 'string',
          },
        },
      },
      booleanProp: {
        type: 'object',
        required: ['value'],
        properties: {
          value: {
            type: 'boolean',
          },
        },
      },
      stringListProp: {
        type: 'object',
        required: ['value'],
        properties: {
          value: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
      },
      dateProp: {
        type: 'object',
        required: ['value'],
        properties: {
          value: {
            type: 'string',
            format: 'datetime',
          },
        },
      },
      calendarDateProp: {
        type: 'object',
        required: ['value'],
        properties: {
          value: {
            type: 'string',
            description:
              "Fecha en formato ISO 8601, sin hora, con separador '-'. Ejemplo: 2023-01-30.",
          },
        },
      },
      numberProp: {
        type: 'object',
        required: ['value'],
        properties: {
          value: {
            type: 'integer',
          },
        },
      },
      topicViewBasic: {
        type: 'object',
        required: ['id'],
        properties: {
          id: {
            type: 'string',
          },
          props: {
            type: 'array',
            items: {
              type: 'ref',
              ref: 'lex:ar.cabildoabierto.wiki.topic#topicProp',
            },
          },
          replyCount: {
            type: 'integer',
          },
          voteCount: {
            type: 'integer',
          },
          documentsCount: {
            type: 'integer',
          },
          editsCount: {
            type: 'integer',
          },
          visCount: {
            type: 'integer',
          },
          pollsCount: {
            type: 'integer',
          },
          popularity: {
            type: 'ref',
            ref: 'lex:ar.cabildoabierto.wiki.topic#topicPopularity',
          },
          lastEdit: {
            type: 'string',
            format: 'datetime',
          },
          currentVersionCreatedAt: {
            type: 'string',
            format: 'datetime',
          },
          numWords: {
            type: 'integer',
          },
          lastSeen: {
            type: 'string',
            format: 'datetime',
          },
          versionRef: {
            type: 'ref',
            ref: 'lex:com.atproto.repo.strongRef',
            description:
              'Opcionalmente se referencia una versión específica del tema',
          },
          versionAuthor: {
            type: 'ref',
            ref: 'lex:ar.cabildoabierto.actor.defs#profileViewBasic',
            description: 'Autor de la versión en versionRef',
          },
          versionCreatedAt: {
            type: 'string',
            format: 'datetime',
          },
        },
      },
      topicVersionContribution: {
        type: 'object',
        required: ['monetized', 'all'],
        properties: {
          monetized: {
            type: 'string',
          },
          all: {
            type: 'string',
          },
        },
      },
      topicPopularity: {
        type: 'object',
        required: ['lastDay', 'lastWeek', 'lastMonth'],
        properties: {
          lastDay: {
            type: 'array',
            items: {
              type: 'integer',
            },
          },
          lastWeek: {
            type: 'array',
            items: {
              type: 'integer',
            },
          },
          lastMonth: {
            type: 'array',
            items: {
              type: 'integer',
            },
          },
        },
      },
    },
  },
  ArCabildoabiertoWikiVote: {
    lexicon: 1,
    id: 'ar.cabildoabierto.wiki.vote',
    defs: {
      main: {
        type: 'record',
        key: 'tid',
        description:
          'Un voto sobre un consenso, fuente o comentario en la wiki.',
        record: {
          type: 'object',
          required: ['subject', 'createdAt'],
          properties: {
            subject: {
              type: 'ref',
              ref: 'lex:com.atproto.repo.strongRef',
            },
            createdAt: {
              type: 'string',
              format: 'datetime',
            },
            label: {
              type: 'ref',
              ref: 'lex:ar.cabildoabierto.wiki.vote#label',
            },
            reason: {
              type: 'ref',
              ref: 'lex:com.atproto.repo.strongRef',
            },
          },
        },
      },
      label: {
        type: 'string',
        knownValues: ['accept', 'reject', 'upvote', 'downvote'],
      },
    },
  },
  ComAtprotoLabelDefs: {
    lexicon: 1,
    id: 'com.atproto.label.defs',
    defs: {
      label: {
        type: 'object',
        description:
          'Metadata tag on an atproto resource (eg, repo or record).',
        required: ['src', 'uri', 'val', 'cts'],
        properties: {
          ver: {
            type: 'integer',
            description: 'The AT Protocol version of the label object.',
          },
          src: {
            type: 'string',
            format: 'did',
            description: 'DID of the actor who created this label.',
          },
          uri: {
            type: 'string',
            format: 'uri',
            description:
              'AT URI of the record, repository (account), or other resource that this label applies to.',
          },
          cid: {
            type: 'string',
            format: 'cid',
            description:
              "Optionally, CID specifying the specific version of 'uri' resource this label applies to.",
          },
          val: {
            type: 'string',
            maxLength: 128,
            description:
              'The short string name of the value or type of this label.',
          },
          neg: {
            type: 'boolean',
            description:
              'If true, this is a negation label, overwriting a previous label.',
          },
          cts: {
            type: 'string',
            format: 'datetime',
            description: 'Timestamp when this label was created.',
          },
          exp: {
            type: 'string',
            format: 'datetime',
            description:
              'Timestamp at which this label expires (no longer applies).',
          },
          sig: {
            type: 'bytes',
            description: 'Signature of dag-cbor encoded label.',
          },
        },
      },
      selfLabels: {
        type: 'object',
        description:
          'Metadata tags on an atproto record, published by the author within the record.',
        required: ['values'],
        properties: {
          values: {
            type: 'array',
            items: {
              type: 'ref',
              ref: 'lex:com.atproto.label.defs#selfLabel',
            },
            maxLength: 10,
          },
        },
      },
      selfLabel: {
        type: 'object',
        description:
          'Metadata tag on an atproto record, published by the author within the record. Note that schemas should use #selfLabels, not #selfLabel.',
        required: ['val'],
        properties: {
          val: {
            type: 'string',
            maxLength: 128,
            description:
              'The short string name of the value or type of this label.',
          },
        },
      },
      labelValueDefinition: {
        type: 'object',
        description:
          'Declares a label value and its expected interpretations and behaviors.',
        required: ['identifier', 'severity', 'blurs', 'locales'],
        properties: {
          identifier: {
            type: 'string',
            description:
              "The value of the label being defined. Must only include lowercase ascii and the '-' character ([a-z-]+).",
            maxLength: 100,
            maxGraphemes: 100,
          },
          severity: {
            type: 'string',
            description:
              "How should a client visually convey this label? 'inform' means neutral and informational; 'alert' means negative and warning; 'none' means show nothing.",
            knownValues: ['inform', 'alert', 'none'],
          },
          blurs: {
            type: 'string',
            description:
              "What should this label hide in the UI, if applied? 'content' hides all of the target; 'media' hides the images/video/audio; 'none' hides nothing.",
            knownValues: ['content', 'media', 'none'],
          },
          defaultSetting: {
            type: 'string',
            description: 'The default setting for this label.',
            knownValues: ['ignore', 'warn', 'hide'],
            default: 'warn',
          },
          adultOnly: {
            type: 'boolean',
            description:
              'Does the user need to have adult content enabled in order to configure this label?',
          },
          locales: {
            type: 'array',
            items: {
              type: 'ref',
              ref: 'lex:com.atproto.label.defs#labelValueDefinitionStrings',
            },
          },
        },
      },
      labelValueDefinitionStrings: {
        type: 'object',
        description:
          'Strings which describe the label in the UI, localized into a specific language.',
        required: ['lang', 'name', 'description'],
        properties: {
          lang: {
            type: 'string',
            description:
              'The code of the language these strings are written in.',
            format: 'language',
          },
          name: {
            type: 'string',
            description: 'A short human-readable name for the label.',
            maxGraphemes: 64,
            maxLength: 640,
          },
          description: {
            type: 'string',
            description:
              'A longer description of what the label means and why it might be applied.',
            maxGraphemes: 10000,
            maxLength: 100000,
          },
        },
      },
      labelValue: {
        type: 'string',
        knownValues: [
          '!hide',
          '!no-promote',
          '!warn',
          '!no-unauthenticated',
          'dmca-violation',
          'doxxing',
          'porn',
          'sexual',
          'nudity',
          'nsfl',
          'gore',
        ],
      },
    },
  },
  ComAtprotoRepoCreateRecord: {
    lexicon: 1,
    id: 'com.atproto.repo.createRecord',
    defs: {
      main: {
        type: 'procedure',
        description:
          'Create a single new repository record. Requires auth, implemented by PDS.',
        input: {
          encoding: 'application/json',
          schema: {
            type: 'object',
            required: ['repo', 'collection', 'record'],
            properties: {
              repo: {
                type: 'string',
                format: 'at-identifier',
                description:
                  'The handle or DID of the repo (aka, current account).',
              },
              collection: {
                type: 'string',
                format: 'nsid',
                description: 'The NSID of the record collection.',
              },
              rkey: {
                type: 'string',
                format: 'record-key',
                description: 'The Record Key.',
                maxLength: 512,
              },
              validate: {
                type: 'boolean',
                description:
                  "Can be set to 'false' to skip Lexicon schema validation of record data, 'true' to require it, or leave unset to validate only for known Lexicons.",
              },
              record: {
                type: 'unknown',
                description: 'The record itself. Must contain a $type field.',
              },
              swapCommit: {
                type: 'string',
                format: 'cid',
                description:
                  'Compare and swap with the previous commit by CID.',
              },
            },
          },
        },
        output: {
          encoding: 'application/json',
          schema: {
            type: 'object',
            required: ['uri', 'cid'],
            properties: {
              uri: {
                type: 'string',
                format: 'at-uri',
              },
              cid: {
                type: 'string',
                format: 'cid',
              },
              commit: {
                type: 'ref',
                ref: 'lex:com.atproto.repo.defs#commitMeta',
              },
              validationStatus: {
                type: 'string',
                knownValues: ['valid', 'unknown'],
              },
            },
          },
        },
        errors: [
          {
            name: 'InvalidSwap',
            description:
              "Indicates that 'swapCommit' didn't match current repo commit.",
          },
        ],
      },
    },
  },
  ComAtprotoRepoDefs: {
    lexicon: 1,
    id: 'com.atproto.repo.defs',
    defs: {
      commitMeta: {
        type: 'object',
        required: ['cid', 'rev'],
        properties: {
          cid: {
            type: 'string',
            format: 'cid',
          },
          rev: {
            type: 'string',
            format: 'tid',
          },
        },
      },
    },
  },
  ComAtprotoRepoDeleteRecord: {
    lexicon: 1,
    id: 'com.atproto.repo.deleteRecord',
    defs: {
      main: {
        type: 'procedure',
        description:
          "Delete a repository record, or ensure it doesn't exist. Requires auth, implemented by PDS.",
        input: {
          encoding: 'application/json',
          schema: {
            type: 'object',
            required: ['repo', 'collection', 'rkey'],
            properties: {
              repo: {
                type: 'string',
                format: 'at-identifier',
                description:
                  'The handle or DID of the repo (aka, current account).',
              },
              collection: {
                type: 'string',
                format: 'nsid',
                description: 'The NSID of the record collection.',
              },
              rkey: {
                type: 'string',
                format: 'record-key',
                description: 'The Record Key.',
              },
              swapRecord: {
                type: 'string',
                format: 'cid',
                description:
                  'Compare and swap with the previous record by CID.',
              },
              swapCommit: {
                type: 'string',
                format: 'cid',
                description:
                  'Compare and swap with the previous commit by CID.',
              },
            },
          },
        },
        output: {
          encoding: 'application/json',
          schema: {
            type: 'object',
            properties: {
              commit: {
                type: 'ref',
                ref: 'lex:com.atproto.repo.defs#commitMeta',
              },
            },
          },
        },
        errors: [
          {
            name: 'InvalidSwap',
          },
        ],
      },
    },
  },
  ComAtprotoRepoGetRecord: {
    lexicon: 1,
    id: 'com.atproto.repo.getRecord',
    defs: {
      main: {
        type: 'query',
        description:
          'Get a single record from a repository. Does not require auth.',
        parameters: {
          type: 'params',
          required: ['repo', 'collection', 'rkey'],
          properties: {
            repo: {
              type: 'string',
              format: 'at-identifier',
              description: 'The handle or DID of the repo.',
            },
            collection: {
              type: 'string',
              format: 'nsid',
              description: 'The NSID of the record collection.',
            },
            rkey: {
              type: 'string',
              description: 'The Record Key.',
              format: 'record-key',
            },
            cid: {
              type: 'string',
              format: 'cid',
              description:
                'The CID of the version of the record. If not specified, then return the most recent version.',
            },
          },
        },
        output: {
          encoding: 'application/json',
          schema: {
            type: 'object',
            required: ['uri', 'value'],
            properties: {
              uri: {
                type: 'string',
                format: 'at-uri',
              },
              cid: {
                type: 'string',
                format: 'cid',
              },
              value: {
                type: 'unknown',
              },
            },
          },
        },
        errors: [
          {
            name: 'RecordNotFound',
          },
        ],
      },
    },
  },
  ComAtprotoRepoListRecords: {
    lexicon: 1,
    id: 'com.atproto.repo.listRecords',
    defs: {
      main: {
        type: 'query',
        description:
          'List a range of records in a repository, matching a specific collection. Does not require auth.',
        parameters: {
          type: 'params',
          required: ['repo', 'collection'],
          properties: {
            repo: {
              type: 'string',
              format: 'at-identifier',
              description: 'The handle or DID of the repo.',
            },
            collection: {
              type: 'string',
              format: 'nsid',
              description: 'The NSID of the record type.',
            },
            limit: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              default: 50,
              description: 'The number of records to return.',
            },
            cursor: {
              type: 'string',
            },
            reverse: {
              type: 'boolean',
              description: 'Flag to reverse the order of the returned records.',
            },
          },
        },
        output: {
          encoding: 'application/json',
          schema: {
            type: 'object',
            required: ['records'],
            properties: {
              cursor: {
                type: 'string',
              },
              records: {
                type: 'array',
                items: {
                  type: 'ref',
                  ref: 'lex:com.atproto.repo.listRecords#record',
                },
              },
            },
          },
        },
      },
      record: {
        type: 'object',
        required: ['uri', 'cid', 'value'],
        properties: {
          uri: {
            type: 'string',
            format: 'at-uri',
          },
          cid: {
            type: 'string',
            format: 'cid',
          },
          value: {
            type: 'unknown',
          },
        },
      },
    },
  },
  ComAtprotoRepoPutRecord: {
    lexicon: 1,
    id: 'com.atproto.repo.putRecord',
    defs: {
      main: {
        type: 'procedure',
        description:
          'Write a repository record, creating or updating it as needed. Requires auth, implemented by PDS.',
        input: {
          encoding: 'application/json',
          schema: {
            type: 'object',
            required: ['repo', 'collection', 'rkey', 'record'],
            nullable: ['swapRecord'],
            properties: {
              repo: {
                type: 'string',
                format: 'at-identifier',
                description:
                  'The handle or DID of the repo (aka, current account).',
              },
              collection: {
                type: 'string',
                format: 'nsid',
                description: 'The NSID of the record collection.',
              },
              rkey: {
                type: 'string',
                format: 'record-key',
                description: 'The Record Key.',
                maxLength: 512,
              },
              validate: {
                type: 'boolean',
                description:
                  "Can be set to 'false' to skip Lexicon schema validation of record data, 'true' to require it, or leave unset to validate only for known Lexicons.",
              },
              record: {
                type: 'unknown',
                description: 'The record to write.',
              },
              swapRecord: {
                type: 'string',
                format: 'cid',
                description:
                  'Compare and swap with the previous record by CID. WARNING: nullable and optional field; may cause problems with golang implementation',
              },
              swapCommit: {
                type: 'string',
                format: 'cid',
                description:
                  'Compare and swap with the previous commit by CID.',
              },
            },
          },
        },
        output: {
          encoding: 'application/json',
          schema: {
            type: 'object',
            required: ['uri', 'cid'],
            properties: {
              uri: {
                type: 'string',
                format: 'at-uri',
              },
              cid: {
                type: 'string',
                format: 'cid',
              },
              commit: {
                type: 'ref',
                ref: 'lex:com.atproto.repo.defs#commitMeta',
              },
              validationStatus: {
                type: 'string',
                knownValues: ['valid', 'unknown'],
              },
            },
          },
        },
        errors: [
          {
            name: 'InvalidSwap',
          },
        ],
      },
    },
  },
  ComAtprotoRepoStrongRef: {
    lexicon: 1,
    id: 'com.atproto.repo.strongRef',
    description: 'A URI with a content-hash fingerprint.',
    defs: {
      main: {
        type: 'object',
        required: ['uri', 'cid'],
        properties: {
          uri: {
            type: 'string',
            format: 'at-uri',
          },
          cid: {
            type: 'string',
            format: 'cid',
          },
        },
      },
    },
  },
} as const satisfies Record<string, LexiconDoc>
export const schemas = Object.values(schemaDict) satisfies LexiconDoc[]
export const lexicons: Lexicons = new Lexicons(schemas)

export function validate<T extends { $type: string }>(
  v: unknown,
  id: string,
  hash: string,
  requiredType: true,
): ValidationResult<T>
export function validate<T extends { $type?: string }>(
  v: unknown,
  id: string,
  hash: string,
  requiredType?: false,
): ValidationResult<T>
export function validate(
  v: unknown,
  id: string,
  hash: string,
  requiredType?: boolean,
): ValidationResult {
  return (requiredType ? is$typed : maybe$typed)(v, id, hash)
    ? lexicons.validate(`${id}#${hash}`, v)
    : {
        success: false,
        error: new ValidationError(
          `Must be an object with "${hash === 'main' ? id : `${id}#${hash}`}" $type property`,
        ),
      }
}

export const ids = {
  AppBskyActorDefs: 'app.bsky.actor.defs',
  AppBskyEmbedDefs: 'app.bsky.embed.defs',
  AppBskyEmbedExternal: 'app.bsky.embed.external',
  AppBskyEmbedImages: 'app.bsky.embed.images',
  AppBskyEmbedRecord: 'app.bsky.embed.record',
  AppBskyEmbedRecordWithMedia: 'app.bsky.embed.recordWithMedia',
  AppBskyEmbedVideo: 'app.bsky.embed.video',
  AppBskyFeedDefs: 'app.bsky.feed.defs',
  AppBskyFeedPost: 'app.bsky.feed.post',
  AppBskyGraphDefs: 'app.bsky.graph.defs',
  AppBskyLabelerDefs: 'app.bsky.labeler.defs',
  AppBskyRichtextFacet: 'app.bsky.richtext.facet',
  ArCabildoabiertoActorCaProfile: 'ar.cabildoabierto.actor.caProfile',
  ArCabildoabiertoActorDefs: 'ar.cabildoabierto.actor.defs',
  ArCabildoabiertoDataDataset: 'ar.cabildoabierto.data.dataset',
  ArCabildoabiertoDataDocument: 'ar.cabildoabierto.data.document',
  ArCabildoabiertoEmbedPoll: 'ar.cabildoabierto.embed.poll',
  ArCabildoabiertoEmbedPollVote: 'ar.cabildoabierto.embed.pollVote',
  ArCabildoabiertoEmbedSelectionQuote: 'ar.cabildoabierto.embed.selectionQuote',
  ArCabildoabiertoEmbedVisualization: 'ar.cabildoabierto.embed.visualization',
  ArCabildoabiertoNotificationListNotifications:
    'ar.cabildoabierto.notification.listNotifications',
  ArCabildoabiertoWikiComment: 'ar.cabildoabierto.wiki.comment',
  ArCabildoabiertoWikiConsensus: 'ar.cabildoabierto.wiki.consensus',
  ArCabildoabiertoWikiDefs: 'ar.cabildoabierto.wiki.defs',
  ArCabildoabiertoWikiEmbed: 'ar.cabildoabierto.wiki.embed',
  ArCabildoabiertoWikiTopic: 'ar.cabildoabierto.wiki.topic',
  ArCabildoabiertoWikiVote: 'ar.cabildoabierto.wiki.vote',
  ComAtprotoLabelDefs: 'com.atproto.label.defs',
  ComAtprotoRepoCreateRecord: 'com.atproto.repo.createRecord',
  ComAtprotoRepoDefs: 'com.atproto.repo.defs',
  ComAtprotoRepoDeleteRecord: 'com.atproto.repo.deleteRecord',
  ComAtprotoRepoGetRecord: 'com.atproto.repo.getRecord',
  ComAtprotoRepoListRecords: 'com.atproto.repo.listRecords',
  ComAtprotoRepoPutRecord: 'com.atproto.repo.putRecord',
  ComAtprotoRepoStrongRef: 'com.atproto.repo.strongRef',
} as const
