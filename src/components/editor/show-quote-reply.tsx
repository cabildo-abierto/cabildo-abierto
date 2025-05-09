import {$createRangeSelection, $getRoot, $nodesOfType, LexicalEditor} from "lexical";
import {useEffect, useRef, useState} from "react";
import {IconButton} from "../../../modules/ui-utils/src/icon-button"
import {ActiveCommentIcon} from "@/components/icons/active-comment-icon";
import {PostContent} from "@/components/feed/post/post-content";
import {SidenoteReplyPreviewFrame} from "@/components/thread/article/sidenote-reply-preview-frame";
import { getPointTypeFromIndex } from "../../../modules/ca-lexical-editor/src/plugins/CommentPlugin/standard-selection";
import {
    $wrapSelectionInMarkNode,
} from '@lexical/mark';
import {
    $createCustomMarkNode,
    $isCustomMarkNode
} from "../../../modules/ca-lexical-editor/src/nodes/CustomMarkNode";
import {getCollectionFromUri} from "@/utils/uri";
import {markdownSelectionToLexicalSelection} from "../../../modules/ca-lexical-editor/src/selection-transforms";
import {ReplyToContent} from "@/components/writing/write-panel/write-panel";
import {PostView} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {isView as isSelectionQuoteView} from "@/lex-api/types/ar/cabildoabierto/embed/selectionQuote"
import {Record as PostRecord} from "@/lex-api/types/app/bsky/feed/post"
import {ModalOnClickControlled} from "../../../modules/ui-utils/src/modal-on-click-controlled";
import {$dfs} from "@lexical/utils";
import {editorStateToMarkdown} from "../../../modules/ca-lexical-editor/src/markdown-transforms";


export const ShowQuoteReplyButton = ({
     reply, pinnedReplies, setPinned, editor, parentContent}: {
    reply: PostView
    pinnedReplies: string[]
    setPinned: (v: boolean) => void
    editor: LexicalEditor
    parentContent: ReplyToContent
}) => {
    const [hovered, setHovered] = useState(false)
    const [open, setOpen] = useState(false)
    const pinned = pinnedReplies.includes(reply.cid)

    const containerRef = useRef<HTMLDivElement | null>(null);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

    useEffect(() => {
        if(open){
            const embed = reply.embed
            if(!isSelectionQuoteView(embed)) return
            editor.update(() => {
                const quote: [number, number] = [embed.start, embed.end]

                const id = "h"+reply.uri
                const nodes = $dfs()
                const marks = nodes.map(n => n.node).filter(n => $isCustomMarkNode(n))

                for(let i = 0; i < marks.length; i++){
                    const ids = marks[i].getIDs()
                    if(ids.includes(id)){
                        console.log("mark already exists", i, id)
                        return
                    }
                }

                const root = $getRoot()

                const s = JSON.stringify(editor.getEditorState().toJSON())
                const lexicalQuote = markdownSelectionToLexicalSelection(s, quote)

                const startNode = getPointTypeFromIndex(root, lexicalQuote.start.node, lexicalQuote.start.offset)
                const endNode = getPointTypeFromIndex(root, lexicalQuote.end.node, lexicalQuote.end.offset)
                const rangeSelection = $createRangeSelection()

                if(!startNode || !endNode) {
                    return
                }

                rangeSelection.anchor = startNode
                rangeSelection.focus = endNode

                try {
                    $wrapSelectionInMarkNode(rangeSelection, false, id, $createCustomMarkNode)
                } catch (err) {
                    console.log("Ocurrió un error con los comentarios sobre el texto.")
                    console.log(err)
                }
            }, {discrete: true})
        } else {
            editor.update(() => {
                const id = "h"+reply.uri
                const nodes = $dfs()
                const marks = nodes.map(n => n.node).filter(n => $isCustomMarkNode(n))
                for(let i = 0; i < marks.length; i++){
                    const ids = marks[i].getIDs()
                    //marks[i].deleteID(id)

                    if(ids.length > 1 && ids.includes(id)){
                        marks[i].deleteID(id)
                    } else if(ids.includes(id)){
                        const markChildren = marks[i].getChildren()
                        let node = marks[i].insertAfter(markChildren[0])
                        for(let j = 1; j < markChildren.length; j++){
                            node = node.insertAfter(markChildren[j])
                        }
                        marks[i].remove()
                    }
                }
            }, {discrete: true})
        }
    }, [editor, open, reply.embed, reply.uri])

    useEffect(() => {
        const el = document.getElementById("selection:"+reply.cid)
        if(el){
            setAnchorEl(el)
        }
    }, [])

    useEffect(() => {
        if(pinned && !open){
            setOpen(true)
        } else if(hovered && !open){
            setOpen(true)
        } else if(!hovered && !pinned && open){
            setOpen(false)
        }
    }, [pinned, hovered, open, reply.cid, setPinned])

    function onClick() {
        setPinned(!pinned)
    }

    function handleClickAway() {
        if(pinned){
            setPinned(false)
        }
    }

    const onMouseEnter = (e) => {
        if(!hovered) setHovered(true)
    }

    function onMouseLeave() {
        if(hovered) setHovered(false)
    }

    const onDelete = async () => {
        const replyTo = (reply.record as PostRecord).reply.parent
        const root = (reply.record as PostRecord).reply.root
        setPinned(false)
        setOpen(false)
        if(replyTo && replyTo.uri){
            // TO DO mutate(threadApiUrl(replyTo.uri))
        }
        if(root && root.uri){
            // TO DO mutate(threadApiUrl(root.uri))
        }
        if(getCollectionFromUri(replyTo.uri) == "ar.cabildoabierto.wiki.topic"){
            // TO DO: Caso reply to es topic
            //const topicId = parentContent.content.topicVersion.topic.id
            // await revalidateTags(["topic:"+encodeURIComponent(topicId)])
            //await mutate("/api/topic/"+encodeURIComponent(topicId))
            //await mutate("/api/topic-feed/"+encodeURIComponent(topicId))
        }
    }

    if(!editor) return null

    const modal = () => (
        <SidenoteReplyPreviewFrame
            post={reply}
            borderBelow={false}
            showingParent={false}
            showingChildren={false}
            onDelete={onDelete}
        >
            <PostContent
                postView={reply}
                hideQuote={true}
            />
        </SidenoteReplyPreviewFrame>
    )

    return <div ref={containerRef} id={"selection:"+reply.cid}>
        <ModalOnClickControlled
            modal={modal}
            open={open}
            setOpen={setOpen}
            anchorEl={anchorEl}
            handleClick={(e) => {setAnchorEl(e.currentTarget)}}
            handleClickAway={handleClickAway}
        >
            <div className={"" + (open ? "text-[var(--text-light)]" : "")}>
                <IconButton
                    color={"background"}
                    size={"small"}
                    onMouseLeave={onMouseLeave}
                    onMouseEnter={onMouseEnter}
                    onClick={onClick}
                >
                    <ActiveCommentIcon fontSize={"inherit"}/>
                </IconButton>
            </div>
        </ModalOnClickControlled>
    </div>
}