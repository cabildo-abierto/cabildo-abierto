import {SaveDraftArticleButton} from "@/components/writing/article/save-draft-article-button";
import {PublishArticleButton} from "@/components/writing/article/publish-article-button";
import {useLayoutConfig} from "@/components/layout/layout-config-context";
import {validArticle} from "@/components/writing/article/valid-article";
import {useState} from "react";
import {SettingsProps} from "../../../../modules/ca-lexical-editor/src/lexical-editor";
import {EditorState} from "lexical";
import {ArCabildoabiertoFeedDefs} from "@/lex-api/index"
import {Draft} from "@/queries/getters/useDrafts"


export const ArticleEditorTopbar = ({
                                        draft,
                                        editorState,
                                        settings,
                                        title,
                                        topicsMentioned,
    setInitialEditorState,
    guardEnabled,
    setGuardEnabled
                                    }: {
    editorState: EditorState
    settings: SettingsProps
    title?: string
    topicsMentioned: ArCabildoabiertoFeedDefs.TopicMention[]
    draft?: Draft
    setInitialEditorState: (s: string) => void
    guardEnabled: boolean
    setGuardEnabled: (s: boolean) => void
}) => {
    const [draftId, setDraftId] = useState<string | null>(draft?.id)
    const [modalOpen, setModalOpen] = useState(false)
    const {isMobile} = useLayoutConfig()
    const {valid} = validArticle(editorState, settings.charLimit, title)

    const unsavedChanges = guardEnabled

    return <div
        className={"flex justify-end w-full pt-3 pb-2 text-[var(--text-light)] space-x-2 items-center " + (isMobile ? "px-3" : "")}
    >
        <SaveDraftArticleButton
            disabled={!unsavedChanges || editorState == null}
            title={title}
            editorState={editorState}
            draftId={draftId}
            onSavedChanges={(time, draftId, state: string) => {
                setDraftId(draftId)
                setInitialEditorState(state)
            }}
        />
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
        />
    </div>
}