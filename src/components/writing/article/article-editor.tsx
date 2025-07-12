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
import { useSession } from "@/queries/api"

const MyLexicalEditor = dynamic(() => import( '../../../../modules/ca-lexical-editor/src/lexical-editor' ), {ssr: false});


const articleEditorSettings = (smallScreen: boolean) => getEditorSettings({
    charLimit: 1200000,
    allowImages: true,
    allowVisualizations: true,
    allowTables: true,
    markdownShortcuts: true,

    tableOfContents: true,
    showToolbar: true,

    isDraggableBlock: !smallScreen,

    placeholder: "Escribí tu artículo...",
    isReadOnly: false,
    editorClassName: "article-content relative pt-4",
    placeholderClassName: "text-[var(--text-light)] absolute top-0 mt-[15px] pt-[32px]",
})


const ArticleEditor = () => {
    const [editorState, setEditorState] = useState<EditorState | undefined>(undefined)
    const [modalOpen, setModalOpen] = useState(false)
    const {topicsMentioned, setLastTextChange, setEditor, title, setTitle} = useTopicsMentioned()
    const {user} = useSession()
    const smallScreen = window.innerWidth < 700

    const settings = articleEditorSettings(smallScreen)

    const valid = validArticle(editorState, settings.charLimit, title)

    let disabled = valid.problem != undefined

    const createdAt = new Date()

    useEffect(() => {
        setLastTextChange(new Date())
    }, [editorState, setLastTextChange])

    /*function refresh() {
        const state = editorState.toJSON()
        const markdown = editorStateToMarkdown(state)
        const stateBack = markdownToEditorState(markdown.markdown)
        const parsedState = editor.parseEditorState(stateBack)
        editor.update(() => {
            editor.setEditorState(parsedState)
        }, {discrete: true})
    }*/

    return <div className={"mb-32"}>
        {/*<button onClick={refresh}>refresh</button>*/}
        <div className="flex justify-between mt-3 items-center w-full px-3 pb-2">
            <div className="flex justify-between w-full text-[var(--text-light)]">
                <BackButton defaultURL={"/"}/>
                <PublishArticleButton
                    title={title}
                    disabled={disabled}
                    modalOpen={modalOpen}
                    setModalOpen={setModalOpen}
                    editorState={editorState}
                    mentions={topicsMentioned}
                />
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