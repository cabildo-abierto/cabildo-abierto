import React from "react"
import {CreatePostProps} from "./write-post";
import {$Typed} from "@/lex-api/util";
import {ArCabildoabiertoWikiTopicVersion, ArCabildoabiertoFeedDefs} from "@/lex-api/index"
import WritePanelPanel from "@/components/writing/write-panel/write-panel-panel";
import {QueryClient, useMutation, useQueryClient} from "@tanstack/react-query";
import {splitUri} from "@/utils/uri";
import {
    invalidateQueries,
    updateContentInQueries
} from "@/queries/mutations/updates";
import {ArCabildoabiertoActorDefs} from "@/lex-api"
import {produce} from "immer";
import {post} from "@/utils/fetch";
import {MarkdownSelection} from "../../../../modules/ca-lexical-editor/src/selection/markdown-selection";
import {LexicalSelection} from "../../../../modules/ca-lexical-editor/src/selection/lexical-selection";
import {threadQueryKey} from "@/queries/getters/useThread";
import {useSession} from "@/queries/getters/useSession";
import {useProfile} from "@/queries/getters/useProfile";
import {postOrArticle} from "@/utils/type-utils";


function optimisticCreatePost(qc: QueryClient, post: CreatePostProps, author: ArCabildoabiertoActorDefs.ProfileViewDetailed, replyTo: ReplyToContent) {
    if (post.reply) {
        function parentUpdater(content: ArCabildoabiertoFeedDefs.FeedViewContent["content"]) {
            return produce(content, draft => {
                if (!postOrArticle(draft)) return
                draft.replyCount++
            })
        }

        updateContentInQueries(qc, post.reply.parent.uri, parentUpdater)
    }
}


function invalidateQueriesAfterPostCreationSuccess(
    uri: string,
    replyTo: ReplyToContent,
    quotedPost: $Typed<ArCabildoabiertoFeedDefs.PostView> | $Typed<ArCabildoabiertoFeedDefs.ArticleView> | $Typed<ArCabildoabiertoFeedDefs.FullArticleView>,
    author: ArCabildoabiertoActorDefs.ProfileViewDetailed,
    qc: QueryClient
) {
    const queriesToInvalidate: string[][] = []

    if (replyTo) {
        const {did, rkey} = splitUri(replyTo.uri)

        queriesToInvalidate.push(
            ["profile-feed", author.handle, "main"],
            ["profile-feed", author.handle, "replies"]
        )

        queriesToInvalidate.push(
            threadQueryKey(replyTo.uri)
        )

        if (ArCabildoabiertoWikiTopicVersion.isTopicView(replyTo)) {
            const topicId = replyTo.id
            queriesToInvalidate.push(["topic-feed", topicId, "replies"])
            queriesToInvalidate.push(["topic-quote-replies", did, rkey])
        }
    } else if (quotedPost) {
        queriesToInvalidate.push(
            ["profile-feed", author.handle, "main"]
        )
        queriesToInvalidate.push(["details-content", "quotes", quotedPost.uri])
    } else {
        queriesToInvalidate.push(
            ["profile-feed", author.handle, "main"]
        )
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
    quotedPost?: $Typed<ArCabildoabiertoFeedDefs.PostView> | $Typed<ArCabildoabiertoFeedDefs.ArticleView> | $Typed<ArCabildoabiertoFeedDefs.FullArticleView>
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

    async function createPost({body}: { body: CreatePostProps }) {
        return await post<CreatePostProps, { uri: string }>("/post", body)
    }

    async function handleSubmit(body: CreatePostProps) {
        createPostMutation.mutate({body})
    }

    const createPostMutation = useMutation({
        mutationFn: createPost,
        onMutate: (post) => {
            try {
                optimisticCreatePost(qc, post.body, author, replyTo)
                onClose()
            } catch (err) {
                console.log("error on mutation", err)
            }
        },
        onSuccess: ({data}) => {
            invalidateQueriesAfterPostCreationSuccess(data.uri, replyTo, quotedPost, author, qc)
        }
    })

    return <WritePanelPanel
        replyTo={replyTo}
        open={open}
        onClose={onClose}
        selection={selection}
        quotedPost={quotedPost}
        handleSubmit={handleSubmit}
        postView={postView}
    />
};


export default WritePanel;
