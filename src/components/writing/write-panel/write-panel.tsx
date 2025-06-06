import React from "react"
import {CreatePostProps, ImagePayloadForPostCreation} from "./write-post";
import {$Typed} from "@atproto/api";
import {
    ArticleView,
    FeedViewContent,
    FullArticleView,
    isFullArticleView,
    PostView,
    ThreadViewContent
} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {isTopicView, TopicView} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";
import WritePanelPanel from "@/components/writing/write-panel/write-panel-panel";
import {QueryClient, useMutation, useQueryClient} from "@tanstack/react-query";
import {getUri, splitUri} from "@/utils/uri";
import {contentQueriesFilter} from "@/queries/updates";
import {threadQueryKey, useProfile, useSession} from "@/queries/api";
import {Profile} from "@/lib/types";
import {ProfileViewBasic} from "@/lex-api/types/ar/cabildoabierto/actor/defs";
import {InfiniteFeed} from "@/components/feed/feed/feed";
import {produce} from "immer";
import {post} from "@/utils/fetch";
import {View as EmbedImagesView, ViewImage} from "@/lex-api/types/app/bsky/embed/images"
import {MarkdownSelection} from "../../../../modules/ca-lexical-editor/src/selection/markdown-selection";
import {LexicalSelection} from "../../../../modules/ca-lexical-editor/src/selection/lexical-selection";


function addPostToFeedQuery(qc: QueryClient, queryKey: string[], post: FeedViewContent) {
    qc.setQueryData(queryKey, old => {
        if(!old) return old
        const data = old as InfiniteFeed<FeedViewContent>

        return produce(data, draft => {
            if(draft.pages.length == 0) {
                draft.pages = [{
                    data: [post],
                    nextCursor: undefined
                }]
            } else {
                draft.pages[0].data = [
                    post,
                    ...draft.pages[0].data
                ]
            }
        })
    })
}


function addReplyPostToThreadQuery(qc: QueryClient, queryKey: string[], post: FeedViewContent) {
    qc.setQueryData(queryKey, old => {
        if(!old) return old
        const data = old as ThreadViewContent

        return produce(data, draft => {
            if(!draft.replies) draft.replies = []
            draft.replies = [{
                $type: "ar.cabildoabierto.feed.defs#threadViewContent",
                content: post.content,
            }, ...draft.replies]
        })
    })
}


function imagePayloadToEmbedImageView(images: ImagePayloadForPostCreation[]): $Typed<EmbedImagesView> {

    function payloadToViewImage(payload: ImagePayloadForPostCreation): ViewImage {
        const src = payload.$type == "url" ? payload.src : `data:image/png;base64,${payload.base64}`

        return {
            $type: "app.bsky.embed.images#viewImage",
            thumb: src,
            fullsize: src,
            alt: ""
        }
    }

    return {
        $type: "app.bsky.embed.images#view",
        images: images.map(payloadToViewImage)
    }
}


function getEmbedViewFromCreatePost(post: CreatePostProps, replyTo: ReplyToContent): PostView["embed"] | undefined | "error" {
    if(post.selection){
        if(!isFullArticleView(replyTo) && !isTopicView(replyTo)) return undefined
        if(post.images && post.images.length > 0 || post.externalEmbedView) return "error" // TO DO
        return {
            $type: "ar.cabildoabierto.embed.selectionQuote#view",
            start: post.selection[0],
            end: post.selection[1],
            quotedText: replyTo.text,
            quotedTextFormat: replyTo.format,
            quotedContent: replyTo.uri
        }
    } else if(post.externalEmbedView){
        if(post.images) return "error" // TO DO
        return post.externalEmbedView
    } else if(post.visualization){
        return "error"
    } else if(post.images){
        return imagePayloadToEmbedImageView(post.images)
    } else if(post.quotedPost){
        return "error" // TO DO
    }
}


function optimisticCreatePost(qc: QueryClient, post: CreatePostProps, author: Profile, replyTo: ReplyToContent) {
    const basicAuthor: ProfileViewBasic = {
        $type: "ar.cabildoabierto.actor.defs#profileViewBasic",
        did: author.bsky.did,
        handle: author.bsky.handle,
        displayName: author.bsky.displayName,
        avatar: author.bsky.avatar,
        caProfile: author.ca.inCA ? "optimistic" : undefined
    }

    const embed: PostView["embed"] | undefined | "error" = getEmbedViewFromCreatePost(post, replyTo)

    if(embed == "error") {
        return
    }

    const content: $Typed<PostView> = {
        $type: "ar.cabildoabierto.feed.defs#postView",
        uri: getUri(author.bsky.did, "app.bsky.feed.post", "optimistic"),
        cid: "optimistic-post-cid",
        author: basicAuthor,
        uniqueViewsCount: 0,
        likeCount: 0,
        repostCount: 0,
        bskyLikeCount: 0,
        bskyQuoteCount: 0,
        bskyRepostCount: 0,
        replyCount: 0,
        embed: embed,
        record: {
            text: post.text
        },
        indexedAt: new Date().toISOString(),
        viewer: {}
    }

    const feedContent: FeedViewContent = {
        content
    }

    if(post.reply){
        console.log("adding post to feed query")
        const {did, collection, rkey} = splitUri(post.reply.parent.uri)
        addPostToFeedQuery(qc, ["thread-feed", did, collection, rkey], feedContent)
        addReplyPostToThreadQuery(qc, threadQueryKey(post.reply.parent.uri), feedContent)
    }
    addPostToFeedQuery(qc, ["main-feed", "siguiendo"], feedContent)
    addPostToFeedQuery(qc, ["profile-feed", author.bsky.handle, "main"], feedContent)
}


export type ReplyToContent = $Typed<PostView> | $Typed<ArticleView> | $Typed<FullArticleView> | $Typed<TopicView>


type WritePanelProps = {
    replyTo?: ReplyToContent
    open: boolean
    onClose: () => void
    selection?: MarkdownSelection | LexicalSelection
    quotedPost?: PostView
}


const WritePanel = ({
                               replyTo,
                               open,
                               onClose,
                               selection,
                               quotedPost
                           }: WritePanelProps) => {
    const qc = useQueryClient()
    const {user} = useSession()
    const {data: author} = useProfile(user.handle)

    async function createPost({body}: {body: CreatePostProps}) {
        return await post<CreatePostProps, { uri: string }>("/post", body)
    }

    async function handleSubmit(body: CreatePostProps) {
        createPostMutation.mutate({body})
    }

    const createPostMutation = useMutation({
        mutationFn: createPost,
        onMutate: (post) => {
            const optimisticUri = getUri("", "app.bsky.feed.post", "")
            if(replyTo) qc.cancelQueries(contentQueriesFilter(replyTo.uri))
            qc.cancelQueries(contentQueriesFilter(optimisticUri))
            optimisticCreatePost(qc, post.body, author, replyTo)
            onClose()
        },
        onSuccess: async ({data}) => {
            if(replyTo) {
                qc.invalidateQueries(contentQueriesFilter(replyTo.uri))
            }
            qc.invalidateQueries(contentQueriesFilter(data.uri))
        },
    })

    return <WritePanelPanel
        replyTo={replyTo}
        open={open}
        onClose={onClose}
        selection={selection}
        quotedPost={quotedPost}
        handleSubmit={handleSubmit}
    />
};


export default WritePanel;
