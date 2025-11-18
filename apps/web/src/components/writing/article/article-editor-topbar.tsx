import {SaveDraftArticleButton} from "./save-draft-article-button";
import {PublishArticleButton} from "./publish-article-button";
import {useLayoutConfig} from "../../layout/main-layout/layout-config-context";
import {validArticle} from "./valid-article";
import {useState} from "react";
import {SettingsProps} from "@/components/editor";
import {EditorState} from "lexical";
import {ArCabildoabiertoFeedDefs} from "@cabildo-abierto/api"
import {Draft} from "@/queries/getters/useDrafts"
import {cn} from "@/lib/utils";


export const ArticleEditorTopbar = ({
                                        draft,
                                        editorState,
                                        settings,
                                        title,
                                        topicsMentioned,
    setInitialEditorState,
    guardEnabled,
    setGuardEnabled,
    article
                                    }: {
    editorState: EditorState
    settings: SettingsProps
    title?: string
    topicsMentioned: ArCabildoabiertoFeedDefs.TopicMention[]
    draft?: Draft
    setInitialEditorState: (s: string) => void
    guardEnabled: boolean
    setGuardEnabled: (s: boolean) => void
    article?: ArCabildoabiertoFeedDefs.FullArticleView
}) => {
    const [draftId, setDraftId] = useState<string | null>(draft?.id)
    const [modalOpen, setModalOpen] = useState(false)
    const {isMobile} = useLayoutConfig()
    const {valid} = validArticle(editorState, settings.charLimit, title)

    return <div
        className={cn("flex justify-end w-full pt-3 pb-2 space-x-2 items-center", isMobile && "px-3")}
    >
        {!article && <SaveDraftArticleButton
            disabled={!guardEnabled || editorState == null}
            title={title}
            editorState={editorState}
            draftId={draftId}
            onSavedChanges={(time, draftId, state: string) => {
                setDraftId(draftId)
                setInitialEditorState(state)
            }}
        />}
        <PublishArticleButton
            title={title}
            disabled={!valid}
            modalOpen={modalOpen}
            setModalOpen={setModalOpen}
            editorState={editorState}
            mentions={topicsMentioned}
            draftId={draftId}
            guardEnabled={guardEnabled}
            setGuardEnabled={setGuardEnabled}
            article={article}
        />
    </div>
}