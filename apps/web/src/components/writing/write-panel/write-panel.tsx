import React from "react"
import {$Typed, CreatePostProps} from "@cabildo-abierto/api";
import {ArCabildoabiertoWikiTopicVersion, ArCabildoabiertoFeedDefs, ArCabildoabiertoEmbedRecord} from "@cabildo-abierto/api"
import WritePanelPanel from "./write-panel-panel";
import {QueryClient, useQueryClient} from "@tanstack/react-query";
import {
    invalidateQueries, updateContentInQueries
} from "@/queries/mutations/updates";
import {ArCabildoabiertoActorDefs} from "@cabildo-abierto/api"
import {post} from "../../utils/react/fetch";
import {useSession} from "@/components/auth/use-session";
import {produce} from "immer";
import {postOrArticle} from "@/utils/type-utils";
import {
    getDidFromUri,
    getRkeyFromUri,
    getUri,
    shortCollectionToCollection
} from "@cabildo-abierto/utils";
import {usePathname, useRouter} from "next/navigation";
import {ComAtprotoRepoStrongRef} from "@atproto/api"
import {MarkdownSelection} from "@/components/editor/selection/markdown-selection";
import {LexicalSelection} from "@/components/editor/selection/lexical-selection";
import {InfiniteFeed} from "@/components/feed/types";
import {useProfile} from "@/components/perfil/use-profile";
import {contentUrl} from "@/components/utils/react/url";

function searchInThreadQuery(thread: $Typed<ArCabildoabiertoFeedDefs.ThreadViewContent>, cond: (uri: string) => boolean) {
    if(!thread) return false
    if((ArCabildoabiertoFeedDefs.isPostView(thread.content) || ArCabildoabiertoFeedDefs.isArticleView(thread.content) || ArCabildoabiertoFeedDefs.isFullArticleView(thread.content)) && cond(thread.content.uri)) {
        return true
    }
    let parent: ArCabildoabiertoFeedDefs.ThreadViewContent["parent"] | null = thread.parent
    while(ArCabildoabiertoFeedDefs.isThreadViewContent(parent)) {
        if(searchInThreadQuery(parent, cond)) {
            return true
        }
        parent = parent.parent
    }
    if(thread.replies) {
        for (const r of thread.replies) {
            if(ArCabildoabiertoFeedDefs.isThreadViewContent(r)) {
                if(searchInThreadQuery(r, cond)){
                    return true
                }
            }
        }
    }
    return false
}


function invalidateQueriesAfterPostCreationSuccess(
    uri: string,
    replyTo: ReplyToContent,
    author: ArCabildoabiertoActorDefs.ProfileViewDetailed,
    qc: QueryClient,
    originalUri?: string,
    quotedPost?: ArCabildoabiertoEmbedRecord.View["record"]
) {
    const queriesToInvalidate: string[][] = []

    function isRelevantUri(v: string) {
        return v == uri || v == originalUri || replyTo && v == replyTo.uri
    }

    qc.getQueryCache().getAll().map(query => {
        const k = query.queryKey as string[]
        const data = query.state.data
        if(k[0] == "thread") {
            const thread = data as $Typed<ArCabildoabiertoFeedDefs.ThreadViewContent>
            if(searchInThreadQuery(thread, isRelevantUri)) {
                queriesToInvalidate.push(k)
            }
        } else if(k[0] == "topic-quote-replies") {
            const posts = data as ArCabildoabiertoFeedDefs.PostView[]
            if (posts && posts.some(p => isRelevantUri(p.uri))) {
                queriesToInvalidate.push(k)
            }
        } else if(k[0] == "details-content" && k[1] == "quotes") {
            const posts = data as InfiniteFeed<ArCabildoabiertoFeedDefs.PostView>
            if(posts && posts.pages.some(page => page.data.some(d => isRelevantUri(d.uri)))){
                queriesToInvalidate.push(k)
            }
        } else if(k[0] == "profile-feed" && k[1] == author.handle) {
            queriesToInvalidate.push(k)
        }
    })

    if (replyTo) {
        if(ArCabildoabiertoWikiTopicVersion.isTopicView(replyTo)){
            queriesToInvalidate.push(["topic-quote-replies", getDidFromUri(replyTo.uri), getRkeyFromUri(replyTo.uri)])
            queriesToInvalidate.push(["topic-discussion", replyTo.uri])
            queriesToInvalidate.push(["topic-history", replyTo.id])
        }

        function parentUpdater(content: ArCabildoabiertoFeedDefs.FeedViewContent["content"]) {
            return produce(content, draft => {
                if (!postOrArticle(draft)) return
                draft.replyCount++
            })
        }

        updateContentInQueries(qc, replyTo.uri, parentUpdater)
    }
    if(quotedPost && (ArCabildoabiertoEmbedRecord.isViewRecord(quotedPost) || ArCabildoabiertoEmbedRecord.isViewArticleRecord(quotedPost))) {
        function quotedUpdater(content: ArCabildoabiertoFeedDefs.FeedViewContent["content"]) {
            return produce(content, draft => {
                if (!postOrArticle(draft)) return
                draft.quoteCount++
                draft.bskyQuoteCount++
            })
        }

        updateContentInQueries(qc, quotedPost.uri, quotedUpdater)
    }
    invalidateQueries(qc, queriesToInvalidate)
}


export type ReplyToContent = $Typed<ArCabildoabiertoFeedDefs.PostView> |
    $Typed<ArCabildoabiertoFeedDefs.ArticleView> |
    $Typed<ArCabildoabiertoFeedDefs.FullArticleView> |
    $Typed<ArCabildoabiertoWikiTopicVersion.TopicView> | $Typed<ComAtprotoRepoStrongRef.Main>


type WritePanelProps = {
    replyTo?: ReplyToContent
    open: boolean
    onClose: () => void
    selection?: MarkdownSelection | LexicalSelection
    quotedPost?: ArCabildoabiertoEmbedRecord.View["record"]
    postView?: ArCabildoabiertoFeedDefs.PostView
}


const WritePanel = ({
                        replyTo,
                        open,
                        onClose,
                        selection,
                        quotedPost,
                        postView
                    }: WritePanelProps) => {
    const qc = useQueryClient()
    const {user} = useSession()
    const {data: author} = useProfile(user.handle)
    const router = useRouter()
    const pathname = usePathname()

    async function createPost({body}: { body: CreatePostProps }) {
        return await post<CreatePostProps, { uri: string }>("/post", body)
    }

    async function handleSubmit(body: CreatePostProps) {
        const res = await createPost({body})
        if(res.success === true) {
            const originalUri = body.threadElements[0].uri
            invalidateQueriesAfterPostCreationSuccess(
                res.value.uri,
                replyTo,
                author,
                qc,
                originalUri,
                quotedPost
            )
            if(pathname.startsWith("/c/")){
                const params = pathname.split("/c/")[1]
                let [did, collection, rkey] = params.split("/")
                if(typeof did == "string" && typeof collection == "string" && typeof rkey == "string"){
                    collection = shortCollectionToCollection(collection)
                    const currentUri = getUri(did, collection, rkey)
                    if(originalUri && originalUri != res.value.uri && originalUri == currentUri) {
                        router.push(contentUrl(res.value.uri))
                    }
                }
            }
            return {data: res.value}
        } else {
            return {error: res.error}
        }
    }

    return <WritePanelPanel
        replyTo={replyTo}
        open={open}
        onClose={onClose}
        selection={selection}
        quotedPost={quotedPost}
        handleSubmit={handleSubmit}
        postView={postView}
    />
}


export default WritePanel;
