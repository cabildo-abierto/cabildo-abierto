"use client"
import {useEffect, useState} from "react"
import {EditorState} from "lexical"
import dynamic from "next/dynamic"
import {TitleInput} from "./title-input"
import {PublishArticleButton} from "@/components/writing/article/publish-article-button";
import {BackButton} from "../../../../modules/ui-utils/src/back-button";
import {localeDate} from "../../../../modules/ui-utils/src/date";
import {ReadingTime} from "@/components/article/reading-time";
import {getAllText} from "@/components/topics/topic/diff";
import {getEditorSettings} from "@/components/editor/settings";
import GradientHRule from "../../../../modules/ui-utils/src/gradient-hrule";
import {useTopicsMentioned} from "@/components/writing/use-topics-mentioned";
import {TopicsMentioned} from "@/components/article/topics-mentioned";
import {validArticle} from "@/components/writing/article/valid-article";
import {getUsername} from "@/utils/utils";
import {useSession} from "@/queries/useSession";
import {Draft, useDraft} from "@/queries/useDrafts"
import {SaveDraftArticleButton} from "@/components/writing/article/save-draft-article-button";
import LoadingSpinner from "../../../../modules/ui-utils/src/loading-spinner";
import {ErrorPage} from "../../../../modules/ui-utils/src/error-page";

const MyLexicalEditor = dynamic(() => import( '../../../../modules/ca-lexical-editor/src/lexical-editor' ), {ssr: false});


const articleEditorSettings = (smallScreen: boolean, draft?: Draft) => getEditorSettings({
    charLimit: 1200000,
    allowImages: true,
    allowVisualizations: true,
    allowTables: true,
    markdownShortcuts: true,

    initialText: draft ? draft.text : "",
    initialTextFormat: draft ? "markdown" : "plain-text",
    embeds: draft ? draft.embeds : null,

    tableOfContents: true,
    showToolbar: true,

    isDraggableBlock: !smallScreen,

    placeholder: "Escribí tu artículo...",
    isReadOnly: false,
    editorClassName: "article-content relative pt-4",
    placeholderClassName: "text-[var(--text-light)] absolute top-0 mt-[15px] pt-[32px]",

    topicMentions: false
})


export const ArticleEditorFromDraft = ({id}: { id: string }) => {
    const {data, isLoading} = useDraft(id)



    if (isLoading) {
        return <div className={"mt-32"}>
            <LoadingSpinner/>
        </div>
    } else if (data) {
        return <ArticleEditor
            draft={data}
        />
    } else {
        return <ErrorPage>
            Ocurrió un error al obtener el borrador.
        </ErrorPage>
    }
}


const ArticleEditor = ({draft}: { draft?: Draft }) => {
    const [editorState, setEditorState] = useState<EditorState | undefined>(undefined)
    const [modalOpen, setModalOpen] = useState(false)
    const [lastSavedChanges, setLastSavedChanges] = useState<Date | null>(null)
    const {
        topicsMentioned,
        lastTextChange,
        setLastTextChange,
        setEditor,
        title,
        setTitle
    } = useTopicsMentioned(draft?.title)
    const [draftId, setDraftId] = useState<string | null>(draft?.id)
    const {user} = useSession()
    const smallScreen = window.innerWidth < 700

    const settings = articleEditorSettings(smallScreen, draft)

    const {valid, empty} = validArticle(editorState, settings.charLimit, title)

    const createdAt = new Date()

    useEffect(() => {
        setLastTextChange(new Date())
    }, [editorState, setLastTextChange])

    const unsavedChanges = !empty && (!lastSavedChanges || lastSavedChanges.getTime() < lastTextChange.getTime())

    return <div className={"mb-32"}>
        <div className="flex justify-between mt-3 items-center w-full px-3 pb-2">
            <div className="flex justify-between w-full text-[var(--text-light)] items-center">
                <BackButton defaultURL={"/"}/>
                <div className={"flex space-x-2"}>
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
            </div>
        </div>
        <GradientHRule/>
        <div className="mt-8 rounded-lg px-5">
            <div className={"mb-2"}>
                <TopicsMentioned mentions={topicsMentioned}/>
            </div>
            <TitleInput onChange={setTitle} title={title}/>
            <div className="gap-x-4 flex flex-wrap items-baseline md:text-lg sm:text-base text-sm">
                <div className={"text-[var(--text-light)] truncate"}>
                    <span>
                        Artículo de
                    </span> <span className={"font-semibold"}>
                        {getUsername(user)}
                    </span>
                </div>
                <div className={"max-[500px]:text-sm text-[var(--text-light)]"}>
                    {localeDate(createdAt, true)}
                </div>
                <div className={"text-[var(--text-light)]"}>
                    {editorState && <ReadingTime
                        numWords={getAllText(editorState.toJSON().root).split(" ").length}
                    />}
                </div>
            </div>
        </div>
        <div className={"mt-8 px-4"}>
            <MyLexicalEditor
                settings={settings}
                setEditor={setEditor}
                setEditorState={setEditorState}
            />
        </div>
    </div>
}


export default ArticleEditor