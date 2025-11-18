import {SettingsProps} from "@/components/editor";
import {ReplyToContent} from "./write-panel/write-panel";
import {Dispatch, SetStateAction, useEffect, useMemo, useRef, useState} from "react";
import {$getRoot, EditorState, LexicalEditor} from "lexical";
import {$createSidenoteNode} from "@/components/editor/nodes/SidenoteNode";
import {$wrapNodeInElement} from "@lexical/utils";
import {createPortal} from "react-dom";
import {NodeQuoteReplies} from "./node-quote-replies";
import {useLayoutConfig} from "../layout/main-layout/layout-config-context";
import {MarkdownSelection} from "@/components/editor/selection/markdown-selection";
import {LexicalSelection} from "@/components/editor/selection/lexical-selection";
import {useTrackReading} from "../feed/article/track-reading";
import {useSession} from "@/components/auth/use-session";
import {ArCabildoabiertoFeedDefs} from "@cabildo-abierto/api"
import dynamic from "next/dynamic";
import {ArCabildoabiertoEmbedSelectionQuote} from "@cabildo-abierto/api"
import {useLoginModal} from "../auth/login-modal-provider";

const CAEditor = dynamic(() => import("@/components/editor/ca-editor").then(mod => mod.CAEditor), {ssr: false})


const WritePanel = dynamic(() => import('./write-panel/write-panel'), {
    ssr: false
})

type EditorWithQuoteCommentsProps = {
    uri: string
    cid: string
    settings: SettingsProps
    replyTo: ReplyToContent
    setEditor: (editor: LexicalEditor) => void
    editor: LexicalEditor
    setEditorState: (state: EditorState) => void
    pinnedReplies: string[]
    setPinnedReplies: Dispatch<SetStateAction<string[]>>
    quoteReplies: ArCabildoabiertoFeedDefs.PostView[]
    clippedToHeight: number | null
}


export function getEditorKey(uri: string, quoteReplies: ArCabildoabiertoFeedDefs.PostView[], editedAt?: string){
    return [uri, editedAt, ...(quoteReplies?.map(q => q.uri) ?? [])].join(":")
}


export const EditorWithQuoteComments = ({
    uri,
    cid,
    settings,
    replyTo,
    editor,
    setEditor,
    setEditorState,
    quoteReplies,
    pinnedReplies,
    setPinnedReplies,
    clippedToHeight
}: EditorWithQuoteCommentsProps) => {
    const [commentingQuote, setCommentingQuote] = useState<MarkdownSelection | LexicalSelection | null>(null)
    const {layoutConfig} = useLayoutConfig()
    const [rightCoordinates, setRightCoordinates] = useState<number>(null)
    const editorElement = useRef<HTMLDivElement>(null)
    const {user} = useSession()
    const {setLoginModalOpen} = useLoginModal()

    useTrackReading(
        uri,
        editorElement,
        clippedToHeight,
        undefined,
    )

    const updateCoordinates = () => {
        if (editorElement.current) {
            const rect = editorElement.current.getBoundingClientRect();
            setRightCoordinates(rect.right)
        }
    }

    const normalizedEditorState = useMemo(() => {
        if(editor){
            return JSON.stringify(editor.getEditorState().toJSON())
        }
    }, [editor])

    useEffect(() => {
        updateCoordinates()
    }, [layoutConfig])

    // blockToUri es un mapa de índices de hijos de la raíz (en Lexical) a uris de respuestas
    const blockToUri = useMemo(() => {
        if (!quoteReplies || quoteReplies.length == 0 || !editor) {
            return new Map<number, string[]>()
        }

        const m = new Map<number, string[]>()
        for (let i = 0; i < quoteReplies.length; i++) {
            const selection = quoteReplies[i].embed
            if (ArCabildoabiertoEmbedSelectionQuote.isView(selection)) {
                const markdownSelection = new MarkdownSelection(selection.start, selection.end)
                const lexicalSelection = markdownSelection.toLexicalSelection(normalizedEditorState)
                const key = lexicalSelection.start.node[0]
                const value = quoteReplies[i].uri
                if (m.has(key)) {
                    m.set(key, [...m.get(key), value])
                } else {
                    m.set(key, [value])
                }
            }
        }

        return m
    }, [editor, quoteReplies])

    useEffect(() => {
        if (!normalizedEditorState) return
        editor.update(() => {
            // cada bloque que tenga uris es wrapeado en un SidenoteNode
            const root = $getRoot()
            const children = root.getChildren()

            blockToUri.forEach((uris, node) => {
                if (children[node] != null) {
                    $wrapNodeInElement(children[node], () => {
                        return $createSidenoteNode(uris)
                    })
                }
            })
        })
    }, [blockToUri, editor])

    const editorSettings = useMemo(() => ({
        ...settings,
        allowComments: true,
        onAddComment: (quote: MarkdownSelection | LexicalSelection) => {
            if(user){
                setCommentingQuote(quote)
            } else {
                setLoginModalOpen(true)
            }
        },
    }), [settings])

    return <>
        <div ref={editorElement}>
            <CAEditor
                settings={editorSettings}
                setEditor={setEditor}
                setEditorState={setEditorState}
            />
        </div>
        {user && <WritePanel
            open={commentingQuote != null}
            onClose={() => {
                setCommentingQuote(null)
            }}
            selection={commentingQuote}
            replyTo={replyTo}
        />}
        {blockToUri && Array.from(blockToUri).map(([_, repliesURIs], index) => {
            return <div key={index}>
                {createPortal(<NodeQuoteReplies
                    replies={quoteReplies.filter((q) => (repliesURIs.includes(q.uri)))}
                    pinnedReplies={pinnedReplies}
                    setPinnedReplies={setPinnedReplies}
                    editor={editor}
                    leftCoordinates={rightCoordinates}
                    parentContent={replyTo}
                />, document.body)}
            </div>
        })}
    </>
}