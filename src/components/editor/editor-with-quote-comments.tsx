import dynamic from "next/dynamic";
import {SettingsProps} from "../../../modules/ca-lexical-editor/src/lexical-editor";
import {ReplyToContent} from "@/components/writing/write-panel/write-panel";
import {Dispatch, SetStateAction, useEffect, useMemo, useRef, useState} from "react";
import {$getRoot, EditorState, LexicalEditor} from "lexical";
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
import {MarkdownSelection} from "../../../modules/ca-lexical-editor/src/selection/markdown-selection";
import {$isEmbedNode} from "../../../modules/ca-lexical-editor/src/nodes/EmbedNode";
import {$isImageNode} from "../../../modules/ca-lexical-editor/src/nodes/ImageNode";
import {LexicalSelection} from "../../../modules/ca-lexical-editor/src/selection/lexical-selection";
import {useTrackReading} from "@/components/article/read-tracking/track-reading";
import {PrettyJSON} from "../../../modules/ui-utils/src/pretty-json";

const MyLexicalEditor = dynamic(() => import( '../../../modules/ca-lexical-editor/src/lexical-editor' ), {ssr: false});

const WritePanel = dynamic(() => import('@/components/writing/write-panel/write-panel'));

type EditorWithQuoteCommentsProps = {
    uri: string
    settings: SettingsProps
    replyTo: ReplyToContent
    setEditor: (editor: LexicalEditor) => void
    editor: LexicalEditor
    setEditorState: (state: EditorState) => void
    pinnedReplies: string[]
    setPinnedReplies: Dispatch<SetStateAction<string[]>>
    quoteReplies: PostView[]
}


/*type HeatmapProps = {
    readChunks: Map<number, number>; // Map<chunkIndex, durationMs>
    totalChunks: number;
};

export const ReadHeatmap: React.FC<HeatmapProps> = ({ readChunks, totalChunks }) => {
    const durations = Array.from({ length: totalChunks }, (_, i) => readChunks.get(i) || 0);

    const maxDuration = Math.max(...durations, 1);

    return (
        <div className="flex w-full h-8 overflow-hidden rounded border border-gray-300">
            {durations.map((duration, i) => {
                const intensity = duration / maxDuration;
                const color = `rgb(255, ${Math.floor(255 - 200 * intensity)}, ${Math.floor(255 - 200 * intensity)})`;

                return (
                    <div
                        key={i}
                        title={`Chunk ${i}, ${duration.toFixed(0)}ms`}
                        style={{
                            flex: 1,
                            backgroundColor: color,
                        }}
                    />
                );
            })}
        </div>
    );
};*/


export const EditorWithQuoteComments = ({
                                            uri,
                                            settings,
                                            replyTo,
                                            editor,
                                            setEditor,
                                            setEditorState,
                                            quoteReplies,
                                            pinnedReplies,
                                            setPinnedReplies
                                        }: EditorWithQuoteCommentsProps) => {
    const [commentingQuote, setCommentingQuote] = useState<MarkdownSelection | LexicalSelection | null>(null)
    const {layoutConfig} = useLayoutConfig()
    const [rightCoordinates, setRightCoordinates] = useState<number>(null)
    const editorElement = useRef<HTMLDivElement>(null)
    //const [readChunks, setReadChunks] = useState<Map<number, number>>(new Map())
    useTrackReading(uri, editorElement)

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
            if (isSelectionQuoteView(selection)) {
                const markdownSelection = new MarkdownSelection(selection.start, selection.end)
                const lexicalSelection = markdownSelection.toLexicalSelection(s)
                const key = lexicalSelection.start.node[0]
                const value = quoteReplies[i].uri
                if (m.has(key)) {
                    m.set(key, [...m.get(key), value])
                } else {
                    m.set(key, [value])
                }
            }
        }

        setBlockToUri(m)
    }, [editor, quoteReplies])

    const state = editor ? editor.getEditorState() : undefined

    useEffect(() => {
        if (!editor || !state) return // !state está solo para asegurar que el useEffect se ejecute cuando state cambia
        editor.update(() => {
            if (!blockToUri) return

            const sidenotes = $dfs().map(n => n.node).filter($isSidenoteNode)
            for (let i = 0; i < sidenotes.length; i++) {
                const s = sidenotes[i]
                const children = s.getChildren()
                let node = s.insertAfter(children[0])
                for (let j = 1; j < children.length; j++) {
                    node = node.insertAfter(children[j])
                }
                s.remove()
            }

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
    }, [blockToUri, editor, state])

    // Esto es necesario por algún motivo muy extraño relacionado con cómo insertamos los embeds en el editor.
    const [hasRefreshed, setHasRefreshed] = useState(false)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (editor) {
                editor.update(() => {
                    const state = editor.getEditorState().toJSON();
                    const nodes = $dfs()
                    if (nodes.some(n => $isEmbedNode(n.node) || $isImageNode(n.node))) {
                        const stateStr = JSON.stringify(state);
                        const newState = editor.parseEditorState(stateStr);
                        editor.setEditorState(newState);
                    }
                });
                setHasRefreshed(true);
            }
        }, 200);

        return () => clearTimeout(timeoutId);
    }, [editor, hasRefreshed])

    const editorSettings = useMemo(() => ({
        ...settings,
        allowComments: true,
        onAddComment: (quote: MarkdownSelection | LexicalSelection) => {
            setCommentingQuote(quote)
        },
    }), [settings]);

    return <>
        <div ref={editorElement}>
            <MyLexicalEditor
                settings={editorSettings}
                setEditor={setEditor}
                setEditorState={setEditorState}
            />
        </div>
        <WritePanel
            open={commentingQuote != null}
            onClose={() => {
                setCommentingQuote(null)
            }}
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

        {/*<ReadHeatmap readChunks={readChunks} totalChunks={totalChunks}/>

        <div>
            Porcentaje leído: %{(Array.from(readChunks.values()).map(r => r > 20000 ? 1 : 0).reduce((acc, cur) => acc+cur, 0) * 100 / totalChunks).toFixed(2)}
        </div>*/}
    </>
}