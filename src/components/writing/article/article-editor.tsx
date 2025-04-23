"use client"

import {QueryMentionsProps, SettingsProps} from "../../../../modules/ca-lexical-editor/src/lexical-editor"
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
import {useSession} from "@/hooks/swr";
import {FooterHorizontalRule} from "../../../../modules/ui-utils/src/footer";
import { queryMentions } from "@/components/editor/query-mentions"
const MyLexicalEditor = dynamic( () => import( '../../../../modules/ca-lexical-editor/src/lexical-editor' ), { ssr: false } );


const articleEditorSettings: () => SettingsProps = () => {
    return {
        isAutocomplete: false,
        isCharLimit: true,
        charLimit: 1200000,
        isRichText: true,
        allowImages: true,
        allowComments: false,
        allowPlots: true,
        allowTables: true,
        markdownShortcuts: true,
        queryMentions,

        measureTypingPerf: false,
        useContextMenu: false,
        tableOfContents: true,
        showTreeView: false,
        showToolbar: true,

        isDraggableBlock: true,
        useSuperscript: false,
        useStrikethrough: false,
        useSubscript: false,

        placeholder: "Escribí tu artículo...",
        initialText: "",
        initialTextFormat: "plain-text",
        isReadOnly: false,

        isAutofocus: true,

        editorClassName: "article-content",
        placeholderClassName: "ContentEditable__placeholder",
        imageClassName: "",
        preventLeave: false
    }
}


const ArticleEditor = () => {
    const [editor, setEditor] = useState<LexicalEditor | undefined>(undefined)
    const [editorState, setEditorState] = useState<EditorState | undefined>(undefined)
    const [title, setTitle] = useState("")
    const {user} = useSession()

    const settings = articleEditorSettings()
    settings.editorClassName += " px-2 pt-4"
    settings.placeholderClassName += " px-2 pt-[32px]"

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
        <div className={"mt-8 px-1"}>
            <MyLexicalEditor
                settings={settings}
                setEditor={setEditor}
                setEditorState={setEditorState}
            />
        </div>
    </div>
}


export default ArticleEditor