"use client"
import {useEffect, useState} from "react"
import {TitleInput} from "./title-input"
import {getEditorSettings} from "../settings";
import {useTopicsMentioned} from "../use-topics-mentioned";
import {TopicsMentioned} from "../../feed/article/topics-mentioned";
import {Draft, useDraft} from "@/queries/getters/useDrafts"
import {LoadingSpinner} from "@/components/utils/base/loading-spinner";
import {ErrorPage} from "../../utils/error-page";
import {robotoSerif} from "../article-font";
import {LayoutConfigProps, useLayoutConfig} from "../../layout/main-layout/layout-config-context";
import {ArticleEditorTopbar} from "./article-editor-topbar";
import ArticleEditorAuthor from "./article-editor-author-line";
import {useNavigationGuard} from "next-navigation-guard"
import {PreventLeavePopup} from "../../utils/dialogs/prevent-leave-popup";
import { ArCabildoabiertoFeedDefs } from "@cabildo-abierto/api";
import {pxToNumber} from "@cabildo-abierto/utils";
import {cn} from "@/lib/utils";
import {EditorState} from "lexical";
import dynamic from "next/dynamic";

const CAEditor = dynamic(() => import("@/components/editor/ca-editor").then(mod => mod.CAEditor), {ssr: false})



const articleEditorSettings = (
    title: string,
    smallScreen: boolean,
    isMobile: boolean,
    layoutConfig: LayoutConfigProps,
    width: number,
    draft?: Draft,
    article?: ArCabildoabiertoFeedDefs.FullArticleView,
) => getEditorSettings({
    charLimit: 1200000,
    allowImages: true,
    allowVisualizations: true,
    allowTables: true,
    markdownShortcuts: true,

    initialText: draft ? draft.text : article ? article.text : undefined,
    initialTextFormat: draft ? "markdown" : article ? article.format : "plain-text",
    embeds: draft ? draft.embeds : null,

    tableOfContents: layoutConfig.spaceForRightSide,
    title,
    showToolbar: true,

    isDraggableBlock: !smallScreen,

    placeholder: "Escribí tu artículo...",
    isReadOnly: false,
    editorClassName: cn("article-content relative", robotoSerif.variable, pxToNumber(layoutConfig.maxWidthCenter) + 40 > width && "px-5"),
    placeholderClassName: cn("text-[var(--text-light)] absolute top-0", pxToNumber(layoutConfig.maxWidthCenter) + 40 > width && "px-5"),
    editorContainerClassName: cn("article-content relative", robotoSerif.variable),
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


const ArticleEditor = ({draft, article}: {
    draft?: Draft
    article?: ArCabildoabiertoFeedDefs.FullArticleView
}) => {
    const [editorState, setEditorState] = useState<EditorState | undefined>(undefined)
    const initialTitle = draft?.title ?? article?.title
    const {
        topicsMentioned,
        setLastTextChange,
        setEditor,
        title,
        setTitle
    } = useTopicsMentioned(initialTitle)
    const smallScreen = window.innerWidth < 700
    const {isMobile, layoutConfig, width} = useLayoutConfig()
    const [guardEnabled, setGuardEnabled] = useState(false)
    const navGuard = useNavigationGuard({enabled: guardEnabled})
    const [initialEditorState, setInitialEditorState] = useState(null)

    const settings = articleEditorSettings(
        title,
        smallScreen,
        isMobile,
        layoutConfig,
        width,
        draft,
        article,
    )

    useEffect(() => {
        if(editorState){
            const state = JSON.stringify(editorState.toJSON())+`::${title}`
            if(!initialEditorState) {
                setInitialEditorState(state)
            } else if(state != initialEditorState) {
                if(!guardEnabled) setGuardEnabled(true)
            } else {
                if(guardEnabled) setGuardEnabled(false)
            }
        }
        setLastTextChange(new Date())
    }, [editorState, title, setLastTextChange, initialEditorState])


    return <div className={"mb-32"}>
        <ArticleEditorTopbar
            title={title}
            draft={draft}
            settings={settings}
            editorState={editorState}
            topicsMentioned={topicsMentioned}
            setInitialEditorState={setInitialEditorState}
            guardEnabled={guardEnabled}
            setGuardEnabled={setGuardEnabled}
            article={article}
        />
        <div
            className={cn("mt-8 space-y-4", pxToNumber(layoutConfig.maxWidthCenter) + 40 > width && "px-5")}
        >
            <div className={"mb-2"}>
                <TopicsMentioned mentions={topicsMentioned}/>
            </div>
            <TitleInput onChange={setTitle} title={title}/>
            <ArticleEditorAuthor editorState={editorState}/>
        </div>
        <div className={"pt-6"}>
            <CAEditor
                settings={settings}
                setEditor={setEditor}
                setEditorState={setEditorState}
            />
        </div>
        <PreventLeavePopup navGuard={navGuard}/>
    </div>
}


export default ArticleEditor