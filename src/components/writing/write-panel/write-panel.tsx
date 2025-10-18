import React from "react"
import {CreatePostProps} from "./write-post";
import {$Typed} from "@/lex-api/util";
import {ArCabildoabiertoWikiTopicVersion, ArCabildoabiertoFeedDefs, ArCabildoabiertoEmbedRecord} from "@/lex-api/index"
import WritePanelPanel from "@/components/writing/write-panel/write-panel-panel";
import {QueryClient, useQueryClient} from "@tanstack/react-query";
import {
    invalidateQueries, updateContentInQueries
} from "@/queries/mutations/updates";
import {ArCabildoabiertoActorDefs} from "@/lex-api"
import {post} from "@/utils/fetch";
import {MarkdownSelection} from "../../../../modules/ca-lexical-editor/src/selection/markdown-selection";
import {LexicalSelection} from "../../../../modules/ca-lexical-editor/src/selection/lexical-selection";
import {useSession} from "@/queries/getters/useSession";
import {useProfile} from "@/queries/getters/useProfile";
import {
    isArticleView, isFullArticleView,
    isPostView, isThreadViewContent, PostView,
    ThreadViewContent
} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {produce} from "immer";
import {postOrArticle} from "@/utils/type-utils";
import {
    contentUrl,
    getDidFromUri,
    getRkeyFromUri,
    getUri,
    shortCollectionToCollection
} from "@/utils/uri";
import {usePathname, useRouter} from "next/navigation";


function searchInThreadQuery(thread: $Typed<ThreadViewContent>, cond: (uri: string) => boolean) {
    if(!thread) return false
    if((isPostView(thread.content) || isArticleView(thread.content) || isFullArticleView(thread.content)) && cond(thread.content.uri)) {
        return true
    }
    let parent: ThreadViewContent["parent"] | null = thread.parent
    while(isThreadViewContent(parent)) {
        if(searchInThreadQuery(parent, cond)) {
            return true
        }
        parent = parent.parent
    }
    if(thread.replies) {
        for (const r of thread.replies) {
            if(isThreadViewContent(r)) {
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
    originalUri?: string
) {
    const queriesToInvalidate: string[][] = []

    function isRelevantUri(v: string) {
        return v == uri || v == originalUri || replyTo && v == replyTo.uri
    }

    qc.getQueryCache().getAll().map(query => {
        const k = query.queryKey as string[]
        const data = query.state.data
        if(k[0] == "thread") {
            const thread = data as $Typed<ThreadViewContent>
            if(searchInThreadQuery(thread, isRelevantUri)) {
                queriesToInvalidate.push(k)
            }
        } else if(k[0] == "topic-quote-replies" || k[0] == "details-content" && k[1] == "quotes"){
            const posts = data as PostView[]
            if(posts.some(p => isRelevantUri(p.uri))){
                queriesToInvalidate.push(k)
            }
        } else if(k[0] == "profile-feed" && k[1] == author.handle) {
            queriesToInvalidate.push(k)
        }
    })

    if (replyTo) {
        if(ArCabildoabiertoWikiTopicVersion.isTopicView(replyTo)){
            queriesToInvalidate.push(["topic-quote-replies", getDidFromUri(replyTo.uri), getRkeyFromUri(replyTo.uri)])
            queriesToInvalidate.push(["topic-feed", replyTo.id, "replies"])
        }

        function parentUpdater(content: ArCabildoabiertoFeedDefs.FeedViewContent["content"]) {
            return produce(content, draft => {
                if (!postOrArticle(draft)) return
                draft.replyCount++
            })
        }

        updateContentInQueries(qc, replyTo.uri, parentUpdater)
    }
    invalidateQueries(qc, queriesToInvalidate)
}


export type ReplyToContent = $Typed<ArCabildoabiertoFeedDefs.PostView> |
    $Typed<ArCabildoabiertoFeedDefs.ArticleView> |
    $Typed<ArCabildoabiertoFeedDefs.FullArticleView> |
    $Typed<ArCabildoabiertoWikiTopicVersion.TopicView>


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
        if(res.data) {
            invalidateQueriesAfterPostCreationSuccess(res.data.uri, replyTo, author, qc, body.uri)
            if(pathname.startsWith("/c/")){
                const params = pathname.split("/c/")[1]
                let [did, collection, rkey] = params.split("/")
                if(typeof did == "string" && typeof collection == "string" && typeof rkey == "string"){
                    collection = shortCollectionToCollection(collection)
                    const currentUri = getUri(did, collection, rkey)
                    if(body.uri && body.uri != res.data.uri && body.uri == currentUri) {
                        router.push(contentUrl(res.data.uri))
                    }
                }
            }
        }
        return res
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
