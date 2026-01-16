import React, {useState} from "react"
import {BaseFullscreenPopup} from "../../utils/dialogs/base-fullscreen-popup"
import {CloseButton} from "@/components/utils/base/close-button"
import SelectionComponent from "../../buscar/search-selection-component";
import {useRouter} from "next/navigation";
import {CreateTopic} from "./create-topic";
import {emptyChar} from "../../utils/utils";
import {
    ArCabildoabiertoFeedDefs,
    ArCabildoabiertoEmbedRecord, CreatePostProps
} from "@cabildo-abierto/api"
import {BaseButton} from "@/components/utils/base/base-button";
import {ReplyToContent} from "./write-panel";
import {MarkdownSelection} from "@/components/editor/selection/markdown-selection";
import {LexicalSelection} from "@/components/editor/selection/lexical-selection";
import {EditorState} from "lexical";
import {ThreadEditor, ThreadElementState} from "@/components/writing/write-panel/thread-editor";
import {getPlainText} from "@cabildo-abierto/editor-core";


type WritePanelProps = {
    replyTo?: ReplyToContent
    open: boolean
    onClose: () => void
    selection?: MarkdownSelection | LexicalSelection
    quotedPost?: ArCabildoabiertoEmbedRecord.View["record"]
    handleSubmit: (_: CreatePostProps) => Promise<{ error?: string }>
    postView?: ArCabildoabiertoFeedDefs.PostView
}



function emptyEditorState(editorState: EditorState | null) {
    return editorState == null || getPlainText(editorState.toJSON().root).trim().length == 0
}

export function isThreadElementStateEmpty(threadElementState: ThreadElementState) {
    return (!threadElementState.text || threadElementState.text.length == 0) && threadElementState.images.length == 0 && emptyEditorState(threadElementState.editorState) && threadElementState.externalEmbed?.url == null && threadElementState.visualization == null
}


const WritePanelPanel = ({
                             replyTo,
                             open,
                             onClose,
                             selection,
                             quotedPost,
                             handleSubmit,
                             postView,
                         }: WritePanelProps) => {
    const [selected, setSelected] = useState("Publicación")
    const router = useRouter()
    const [hidden, setHidden] = useState(false)
    const isReply = replyTo != undefined

    function optionsNodes(o: string, isSelected: boolean) {
        return <div className="text-[var(--text)] text-sm">
            <BaseButton
                size={"small"}
                className={"w-full py-0"}
            >
                <div className={"px-2 py-[2px]"}>
                    <div
                        className={"uppercase text-[11px] font-semibold " + (isSelected ? "border-b-2 border-[var(--text-light)]" : "")}
                    >
                        {o}
                    </div>
                </div>
            </BaseButton>
        </div>
    }

    function onSelection(o: string) {
        if (o == "Artículo") {
            router.push("/escribir/articulo")
            onClose()
        } else {
            setSelected(o)
        }
    }

    return (
        <BaseFullscreenPopup
            hidden={hidden}
            open={open}
            className="w-full max-w-[512px] sm:w-full"
            backgroundShadow={replyTo == null && quotedPost == null && postView == null}
            overlayClassName={"z-[1399]"}
        >
            <div
                className="w-full rounded pt-1 max-h-[80vh] min-h-[334px] flex flex-col justify-between overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-start space-x-2 pl-1 pr-1">
                    {!isReply && !quotedPost ? <SelectionComponent
                        onSelection={onSelection}
                        selected={selected}
                        optionsNodes={optionsNodes}
                        options={["Publicación", "Artículo", "Tema"]}
                        className={"flex space-x-2"}
                    /> : <div>{emptyChar}</div>}
                    <CloseButton
                        size={"small"}
                        onClose={() => {
                            onClose()
                        }}
                    />
                </div>
                {selected == "Publicación" && <ThreadEditor
                    setHidden={setHidden}
                    onClose={onClose}
                    replyTo={replyTo}
                    quotedPost={quotedPost}
                    postView={postView}
                    handleSubmit={handleSubmit}
                    selection={selection}
                />}
                {selected == "Tema" && <CreateTopic onClose={onClose}/>}
            </div>
        </BaseFullscreenPopup>
    )
};


export default WritePanelPanel;
