"use client"

import {SettingsProps} from "../../../../modules/ca-lexical-editor/src/lexical-editor"
import { useState } from "react"
import { EditorState, LexicalEditor } from "lexical"
import { TitleInput } from "./title-input"
import dynamic from "next/dynamic"
import {validArticle} from "./valid-article";
import {BackButton} from "../../../../modules/ui-utils/src/back-button";
import {PublishArticleButton} from "@/components/writing/article/publish-article-button";
import {Authorship} from "@/components/feed/frame/content-top-row-author";
import {localeDate} from "../../../../modules/ui-utils/src/date";
import {ReadingTime} from "@/components/article/reading-time";
import {getAllText} from "@/components/topics/topic/diff";
import {useSession} from "@/hooks/api";
import {FooterHorizontalRule} from "../../../../modules/ui-utils/src/footer";
import {getEditorSettings} from "@/components/editor/settings";
const MyLexicalEditor = dynamic( () => import( '../../../../modules/ca-lexical-editor/src/lexical-editor' ), { ssr: false } );


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
    placeholderClassName: "text-[var(--text-light)] absolute top-0 mt-[10px] pt-[32px]",
})


const ArticleEditor = () => {
    const [editor, setEditor] = useState<LexicalEditor | undefined>(undefined)
    const [editorState, setEditorState] = useState<EditorState | undefined>(undefined)
    const [title, setTitle] = useState("")
    const {user} = useSession()
    const smallScreen = window.innerWidth < 700

    const settings = articleEditorSettings(smallScreen)

    const valid = validArticle(editorState, settings.charLimit, title)

    let disabled = valid.problem != undefined

    const createdAt = new Date()

    /*async function onReloadMarkdown(){
        let jsonState = JSON.stringify(editorState.toJSON())
        const markdown = editorStateToMarkdown(jsonState)
        jsonState = markdownToEditorState(markdown)
        const state = editor.parseEditorState(jsonState)
        editor.update(() => {
            editor.setEditorState(state)
        })
    }*/

    return <div className={"mb-32"}>
        <div className="flex justify-between mt-3 items-center w-full px-3 pb-2">
			<div className="flex justify-between w-full text-[var(--text-light)]">
                <BackButton defaultURL={"/"}/>
                {/*<Button onClick={onReloadMarkdown} size={"small"} variant={"text"}>
                    Chequear markdown
                </Button>*/}
                <PublishArticleButton
                    editor={editor}
                    title={title}
                    disabled={disabled}
                />
			</div>
		</div>
        <FooterHorizontalRule/>
        <div className="mt-8 rounded-lg px-5">
            <TitleInput onChange={setTitle} title={title}/>
            <div className="gap-x-4 flex flex-wrap items-baseline">
                <span className={"max-[500px]:text-base text-lg text-[var(--text-light)]"}>
                    Artículo de <Authorship content={{author: user}} onlyAuthor={true}/>
                </span>
                <span className={"max-[500px]:text-sm text-[var(--text-light)]"}>
                    {localeDate(createdAt, true)}
                </span>
                <span className={"text-[var(--text-light)]"}>
                    {editorState && <ReadingTime
                        numWords={getAllText(editorState.toJSON().root).split(" ").length}
                    />}
                </span>
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