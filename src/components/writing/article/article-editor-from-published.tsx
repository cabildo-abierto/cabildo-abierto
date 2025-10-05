"use client"

import { useSession } from "@/queries/getters/useSession"
import { getUri } from "@/utils/uri"
import {useThreadWithNormalizedContent} from "@/queries/getters/useThread";
import ArticleEditor from "@/components/writing/article/article-editor";
import LoadingSpinner from "../../../../modules/ui-utils/src/loading-spinner";
import { ArCabildoabiertoFeedDefs } from "@/lex-api";


export const ArticleEditorFromPublished = ({rkey}: {rkey: string}) => {
    const {user} = useSession()
    const uri = getUri(user.did, "ar.cabildoabierto.feed.article", rkey)
    const {query, thread} = useThreadWithNormalizedContent(uri)

    if(query.isLoading || thread == "loading") {
        return <div className={"py-32"}>
            <LoadingSpinner />
        </div>
    } else if(thread && ArCabildoabiertoFeedDefs.isFullArticleView(thread.content)) {
        return <ArticleEditor
            article={thread.content}
        />
    } else {
        return <div className={"text-center text-[var(--text-light)] font-light py-32"}>
            No se encontró el artículo.
        </div>
    }
}