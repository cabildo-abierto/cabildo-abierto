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
                                        lastTextChange
                                    }: {
    editorState: EditorState
    settings: SettingsProps
    title?: string
    topicsMentioned: ArCabildoabiertoFeedDefs.TopicMention[]
    lastTextChange: Date
    draft?: Draft
}) => {
    const [draftId, setDraftId] = useState<string | null>(draft?.id)
    const [modalOpen, setModalOpen] = useState(false)
    const [lastSavedChanges, setLastSavedChanges] = useState<Date | null>(null)
    const {isMobile} = useLayoutConfig()
    const {valid, empty} = validArticle(editorState, settings.charLimit, title)
    const unsavedChanges = !empty && (!lastSavedChanges || lastSavedChanges.getTime() < lastTextChange.getTime())

    return <div
        className={"flex justify-end w-full pt-3 pb-2 text-[var(--text-light)] space-x-2 items-center " + (isMobile ? "px-3" : "")}>
        <SaveDraftArticleButton
            disabled={!unsavedChanges || editorState == null}
            title={title}
            editorState={editorState}
            draftId={draftId}
            onSavedChanges={(time, draftId) => {
                setLastSavedChanges(time)
                setDraftId(draftId)
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
        />
    </div>
}