"use client"

import {SettingsProps} from "../../../../modules/ca-lexical-editor/src/lexical-editor"
import {useEffect, useState} from "react"
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
import {TopicMention} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {TopicsMentioned} from "@/components/article/topics-mentioned";
import {editorStateToMarkdown} from "../../../../modules/ca-lexical-editor/src/markdown-transforms";
import {post} from "@/utils/fetch";
import {PrettyJSON} from "../../../../modules/ui-utils/src/pretty-json";
import {emptyChar} from "@/utils/utils";
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


export const useTopicsMentioned = () => {
    const [topicsMentioned, setTopicsMentioned] = useState<TopicMention[]>([])
    const [lastMentionsFetch, setLastMentionsFetch] = useState(new Date(0))
    const [lastTextChange, setLastTextChange] = useState(new Date(0))
    const [editor, setEditor] = useState<LexicalEditor | undefined>(undefined)
    const [title, setTitle] = useState("")


    useEffect(() => {
        const interval = setInterval(() => {
            if (
                lastTextChange.getTime() - lastMentionsFetch.getTime() > 10000 ||
                (Date.now() - lastTextChange.getTime() > 3000 && lastTextChange.getTime() > lastMentionsFetch.getTime())
            ) {
                setLastMentionsFetch(new Date());

                const fetchTopicsMentioned = async () => {
                    try {
                        const editorStateStr = JSON.stringify(editor.getEditorState().toJSON());
                        const mdText = editorStateToMarkdown(editorStateStr);
                        let data: TopicMention[] = []
                        if(mdText.length + title.length > 0) {
                            data = (await post<{ title: string; text: string }, TopicMention[]>(
                                `/get-topics-mentioned`,
                                {title, text: mdText}
                            )).data
                        }
                        if (data) {
                            setTopicsMentioned(data);
                        }
                    } catch (error) {
                        console.error("Error running async function:", error);
                    }
                };

                fetchTopicsMentioned();
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [lastTextChange, lastMentionsFetch, editor, title]);

    return {
        topicsMentioned,
        setLastTextChange,
        editor,
        setEditor,
        title,
        setTitle
    }
}


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

    return <div className={"mb-32"}>
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