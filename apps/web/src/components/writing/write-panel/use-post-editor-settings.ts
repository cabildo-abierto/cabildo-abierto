import {ArCabildoabiertoFeedDefs} from "@cabildo-abierto/api";
import {SettingsProps} from "@/components/editor";
import {AppBskyFeedPost} from "@atproto/api";
import {useMarkdownFromBsky} from "@/components/writing/write-panel/use-markdown-from-bsky";
import {getEditorSettings} from "@/components/writing/settings";
import {
    isArticle,
    isDataset,
    isPost,
    isTopicVersion,
    isVisualization,
} from "@cabildo-abierto/utils";
import {ThreadElementState} from "@/components/writing/write-panel/write-panel-panel";


function getPlaceholder(replyToCollection: string | undefined, quotedCollection: string | undefined, isVoteReject: boolean) {
    if (!replyToCollection && !quotedCollection) {
        return "¿Qué está pasando?"
    } else {
        const collection = replyToCollection ?? quotedCollection
        if (isPost(collection)) {
            return "Escribí una respuesta"
        } else if (isArticle(collection)) {
            return "Respondé al artículo"
        } else if (isTopicVersion(collection)) {
            return !isVoteReject ? "Responder en la discusión del tema" : "Justificá el rechazo"
        } else if (isVisualization(collection)) {
            return "Respondé a la visualización"
        } else if (isDataset(collection)) {
            return "Respondé al conjunto de datos"
        }
    }
}


export function usePostEditorSettings(
    replyToCollection: string | undefined,
    quoteCollection: string | undefined,
    postView: ArCabildoabiertoFeedDefs.PostView | undefined,
    isVoteReject: boolean,
    threadElementState?: ThreadElementState
): SettingsProps {
    const p = postView?.record as AppBskyFeedPost.Record | undefined
    const {markdown} = useMarkdownFromBsky(p)

    return getEditorSettings({
        placeholder: getPlaceholder(replyToCollection, quoteCollection, isVoteReject),
        placeholderClassName: "text-[var(--text-light)] absolute text-base top-0",
        editorClassName: "link relative h-full text-base",
        isReadOnly: false,
        isRichText: false,
        markdownShortcuts: false,
        topicMentions: false,
        initialText: markdown,
        initialTextFormat: "markdown"
    })
}