import React, {useState} from "react"
import {BaseFullscreenPopup} from "../../layout/base/base-fullscreen-popup"
import {CloseButton} from "../../layout/utils/close-button"
import SelectionComponent from "@/components/buscar/search-selection-component";
import {useRouter} from "next/navigation";
import {CreateTopic} from "./create-topic";
import {CreatePostProps, WritePost} from "./write-post";
import {emptyChar} from "@/utils/utils";
import {MarkdownSelection} from "../../../../modules/ca-lexical-editor/src/selection/markdown-selection";
import {LexicalSelection} from "../../../../modules/ca-lexical-editor/src/selection/lexical-selection";
import {ArCabildoabiertoFeedDefs, ArCabildoabiertoEmbedRecord} from "@/lex-api/index"
import {BaseButton} from "../../layout/base/baseButton";
import {ReplyToContent} from "@/components/writing/write-panel/write-panel";


type WritePanelProps = {
    replyTo?: ReplyToContent
    open: boolean
    onClose: () => void
    selection?: MarkdownSelection | LexicalSelection
    quotedPost?: ArCabildoabiertoEmbedRecord.View["record"]
    handleSubmit: (_: CreatePostProps) => Promise<{ error?: string }>
    postView?: ArCabildoabiertoFeedDefs.PostView
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
                variant={"default"}
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
            className="w-full max-w-[512px]"
            disableScrollLock={true}
            backgroundShadow={true}
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
                {selected == "Publicación" && <WritePost
                    onClose={onClose}
                    replyTo={replyTo}
                    selection={selection}
                    quotedContent={quotedPost}
                    setHidden={setHidden}
                    handleSubmit={handleSubmit}
                    postView={postView}
                />}
                {selected == "Tema" && <CreateTopic onClose={onClose}/>}
            </div>
        </BaseFullscreenPopup>
    )
};


export default WritePanelPanel;
