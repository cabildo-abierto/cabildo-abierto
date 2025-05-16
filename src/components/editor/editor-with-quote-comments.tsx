import dynamic from "next/dynamic";
import {SettingsProps} from "../../../modules/ca-lexical-editor/src/lexical-editor";
import {ReplyToContent} from "@/components/writing/write-panel/write-panel";
import {Dispatch, SetStateAction, useEffect, useRef, useState} from "react";
import {$getRoot, EditorState, LexicalEditor} from "lexical";
import {markdownSelectionToLexicalSelection} from "../../../modules/ca-lexical-editor/src/selection-transforms";
import {
    $createSidenoteNode,
    $isSidenoteNode
} from "../../../modules/ca-lexical-editor/src/nodes/SidenoteNode";
import {$dfs, $wrapNodeInElement} from "@lexical/utils";
import {createPortal} from "react-dom";
import {NodeQuoteReplies} from "./node-quote-replies";
import {useLayoutConfig} from "@/components/layout/layout-config-context";
import {PostView} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {isView as isSelectionQuoteView} from "@/lex-api/types/ar/cabildoabierto/embed/selectionQuote"
import {PrettyJSON} from "../../../modules/ui-utils/src/pretty-json";
const MyLexicalEditor = dynamic( () => import( '../../../modules/ca-lexical-editor/src/lexical-editor' ), { ssr: false } );

const WritePanel = dynamic(() => import('@/components/writing/write-panel/write-panel'));

type EditorWithQuoteCommentsProps = {
    settings: SettingsProps
    replyTo: ReplyToContent
    setEditor: (editor: LexicalEditor) => void
    editor: LexicalEditor
    setEditorState: (state: EditorState) => void
    pinnedReplies: string[]
    setPinnedReplies: Dispatch<SetStateAction<string[]>>
    quoteReplies: PostView[]
}


export const EditorWithQuoteComments = ({
    settings, replyTo, editor, setEditor, setEditorState, quoteReplies, pinnedReplies, setPinnedReplies}: EditorWithQuoteCommentsProps) => {
    const [commentingQuote, setCommentingQuote] = useState<[number, number] | null>(null)
    const {layoutConfig} = useLayoutConfig()
    const [rightCoordinates, setRightCoordinates] = useState<number>(null)
    const editorElement = useRef(null)

    // blockToUri es un mapa de índices de hijos de la raíz (en Lexical) a uris de respuestas
    const [blockToUri, setBlockToUri] = useState<Map<number, string[]> | null>(null)

    const updateCoordinates = () => {
        if (editorElement.current) {
            const rect = editorElement.current.getBoundingClientRect();
            setRightCoordinates(rect.right)
        }
    }

    useEffect(() => {
        updateCoordinates()
    }, [layoutConfig])

    useEffect(() => {
        if (!quoteReplies || quoteReplies.length == 0 || !editor) {
            setBlockToUri(new Map<number, string[]>())
            return
        }
        const m = new Map<number, string[]>()
        for (let i = 0; i < quoteReplies.length; i++) {
            const s = JSON.stringify(editor.getEditorState().toJSON())
            const selection = quoteReplies[i].embed
            if(isSelectionQuoteView(selection)){
                const lexicalSelection = markdownSelectionToLexicalSelection(
                    s,
                    [selection.start, selection.end]
                )
                const key = lexicalSelection.start.node[0]
                const value = quoteReplies[i].uri
                if(m.has(key)){
                    m.set(key, [...m.get(key), value])
                } else {
                    m.set(key, [value])
                }
            }
        }

        setBlockToUri(m)
    }, [editor, quoteReplies])

    useEffect(() => {
        if(!editor) return
        editor.update(() => {

            const sidenotes = $dfs().map(n => n.node).filter($isSidenoteNode)
            for (let i = 0; i < sidenotes.length; i++) {
                const s = sidenotes[i]
                const children = s.getChildren()
                let node = s.insertAfter(children[0])
                for(let j = 1; j < children.length; j++){
                    node = node.insertAfter(children[j])
                }
                s.remove()
            }

            // cada bloque que tenga uris es wrapeado en un SidenoteNode
            const root = $getRoot()
            const children = root.getChildren()

            blockToUri.forEach((uris, node) => {
                if(children[node] != null){
                    $wrapNodeInElement(children[node], () => {
                        return $createSidenoteNode(uris)
                    })
                }
            })
        })
    }, [blockToUri, editor])

    return <>
        <div ref={editorElement}>
            <MyLexicalEditor
                settings={{
                    ...settings,
                    allowComments: true,
                    onAddComment: (quote: [number, number]) => {setCommentingQuote(quote)},
                }}
                setEditor={setEditor}
                setEditorState={setEditorState}
            />
        </div>
        <WritePanel
            open={commentingQuote != null}
            onClose={() => {setCommentingQuote(null)}}
            selection={commentingQuote}
            replyTo={replyTo}
        />

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