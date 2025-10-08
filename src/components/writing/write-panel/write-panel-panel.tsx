import React, {useState} from "react"
import {BaseFullscreenPopup} from "../../../../modules/ui-utils/src/base-fullscreen-popup"
import {CloseButton} from "../../../../modules/ui-utils/src/close-button"
import SelectionComponent from "@/components/buscar/search-selection-component";
import {useRouter} from "next/navigation";
import {CreateTopic} from "./create-topic";
import {CreatePostProps, WritePost} from "./write-post";
import {$Typed} from "@/lex-api/util";
import {emptyChar} from "@/utils/utils";
import {MarkdownSelection} from "../../../../modules/ca-lexical-editor/src/selection/markdown-selection";
import {LexicalSelection} from "../../../../modules/ca-lexical-editor/src/selection/lexical-selection";
import {ArCabildoabiertoFeedDefs, ArCabildoabiertoWikiTopicVersion} from "@/lex-api/index"
import {Button} from "../../../../modules/ui-utils/src/button";


export type ReplyToContent = $Typed<ArCabildoabiertoFeedDefs.PostView> |
    $Typed<ArCabildoabiertoFeedDefs.ArticleView> |
    $Typed<ArCabildoabiertoFeedDefs.FullArticleView> |
    $Typed<ArCabildoabiertoWikiTopicVersion.TopicView>

type WritePanelProps = {
    replyTo?: ReplyToContent
    open: boolean
    onClose: () => void
    selection?: MarkdownSelection | LexicalSelection
    quotedPost?: $Typed<ArCabildoabiertoFeedDefs.PostView> |
        $Typed<ArCabildoabiertoFeedDefs.ArticleView> |
        $Typed<ArCabildoabiertoFeedDefs.FullArticleView>
    handleSubmit: (_: CreatePostProps) => Promise<void>
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
            <Button
                onClick={() => {
                }}
                variant="text"
                color="transparent"
                size={"small"}
                fullWidth={true}
                disableElevation={true}
                sx={{
                    paddingY: 0,
                    borderRadius: 0
                }}
            >
                <div className={"px-2"}>
                    <div
                        className={"uppercase text-[11px] font-semibold " + (isSelected ? "border-b-2 border-[var(--text-light)]" : "")}
                    >
                        {o}
                    </div>
                </div>
            </Button>
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
            color={"background"}
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
                    <CloseButton size="small" color="transparent" onClose={() => {
                        onClose()
                    }}/>
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
