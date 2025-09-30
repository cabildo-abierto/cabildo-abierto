"use client"
import {useEffect, useState} from "react"
import {EditorState} from "lexical"
import dynamic from "next/dynamic"
import {TitleInput} from "./title-input"
import {getEditorSettings} from "@/components/writing/settings";
import {useTopicsMentioned} from "@/components/writing/use-topics-mentioned";
import {TopicsMentioned} from "@/components/thread/article/topics-mentioned";
import {Draft, useDraft} from "@/queries/getters/useDrafts"
import LoadingSpinner from "../../../../modules/ui-utils/src/loading-spinner";
import {ErrorPage} from "../../../../modules/ui-utils/src/error-page";
import {robotoSerif} from "@/components/writing/article-font";
import {LayoutConfigProps, useLayoutConfig} from "@/components/layout/layout-config-context";
import {ArticleEditorTopbar} from "@/components/writing/article/article-editor-topbar";
import ArticleEditorAuthor from "@/components/writing/article/article-editor-author-line";

const MyLexicalEditor = dynamic(() => import( '../../../../modules/ca-lexical-editor/src/lexical-editor' ), {ssr: false});


const articleEditorSettings = (smallScreen: boolean, isMobile: boolean, draft: Draft, layoutConfig: LayoutConfigProps) => getEditorSettings({
    charLimit: 1200000,
    allowImages: true,
    allowVisualizations: true,
    allowTables: true,
    markdownShortcuts: true,

    initialText: draft ? draft.text : "",
    initialTextFormat: draft ? "markdown" : "plain-text",
    embeds: draft ? draft.embeds : null,

    tableOfContents: layoutConfig.spaceForRightSide,
    showToolbar: true,

    isDraggableBlock: !smallScreen,

    placeholder: "Escribí tu artículo...",
    isReadOnly: false,
    editorClassName: `article-content relative ${robotoSerif.variable} ` + (isMobile ? "px-3" : ""),
    placeholderClassName: "text-[var(--text-light)] absolute top-0 " + (isMobile ? "px-3" : ""),

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
    const {
        topicsMentioned,
        lastTextChange,
        setLastTextChange,
        setEditor,
        title,
        setTitle
    } = useTopicsMentioned(draft?.title)
    const smallScreen = window.innerWidth < 700
    const {isMobile, layoutConfig} = useLayoutConfig()

    const settings = articleEditorSettings(
        smallScreen,
        isMobile,
        draft,
        layoutConfig
    )

    useEffect(() => {
        setLastTextChange(new Date())
    }, [editorState, setLastTextChange])


    return <div className={"mb-32"}>
        <ArticleEditorTopbar
            lastTextChange={lastTextChange}
            title={title}
            draft={draft}
            settings={settings}
            editorState={editorState}
            topicsMentioned={topicsMentioned}
        />
        <div className={"mt-8 space-y-4 " + (isMobile ? "px-5" : "")}>
            <div className={"mb-2"}>
                <TopicsMentioned mentions={topicsMentioned}/>
            </div>
            <TitleInput onChange={setTitle} title={title}/>
            <ArticleEditorAuthor editorState={editorState}/>
        </div>
        <div className={"pt-6"}>
            <MyLexicalEditor
                settings={settings}
                setEditor={setEditor}
                setEditorState={setEditorState}
            />
        </div>
    </div>
}


export default ArticleEditor