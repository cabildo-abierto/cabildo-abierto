import React, {useState} from "react"
import {BaseFullscreenPopup} from "../../../../modules/ui-utils/src/base-fullscreen-popup"
import {CloseButton} from "../../../../modules/ui-utils/src/close-button"
import SelectionComponent from "@/components/buscar/search-selection-component";
import {Button} from "@mui/material";
import {useRouter} from "next/navigation";
import {CreateTopic} from "./create-topic";
import {CreatePostProps, WritePost} from "./write-post";
import {$Typed} from "@atproto/api";
import {ArticleView, FullArticleView, PostView} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {TopicView} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";
import {emptyChar} from "@/utils/utils";


export type ReplyToContent = $Typed<PostView> | $Typed<ArticleView> | $Typed<FullArticleView> | $Typed<TopicView>

type WritePanelProps = {
    replyTo?: ReplyToContent
    open: boolean
    onClose: () => void
    selection?: [number, number]
    quotedPost?: PostView
    handleSubmit: (post: CreatePostProps) => Promise<void>
}


const WritePanelPanel = ({
                             replyTo,
                             open,
                             onClose,
                             selection,
                             quotedPost,
                             handleSubmit
                         }: WritePanelProps) => {
    const [selected, setSelected] = useState("Post")
    const router = useRouter()
    const [hidden, setHidden] = useState(false)

    const isReply = replyTo != undefined

    function optionsNodes(o: string, isSelected: boolean) {
        return <div className="text-[var(--text)] text-sm">
            <Button
                onClick={() => {
                }}
                variant="text"
                color="inherit"
                size={"small"}
                fullWidth={true}
                disableElevation={true}
                sx={{
                    textTransform: "none",
                    paddingY: 0,
                    backgroundColor: isSelected ? "var(--background-dark2)" : "transparent",
                    ":hover": {
                        backgroundColor: "var(--background-dark2)"
                    }
                }}
            >
                <div className={"text-[var(--text-light)]"}>
                    {o}
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
        <BaseFullscreenPopup hidden={hidden} open={open} className="w-full max-w-[512px]">
            <div className="w-full rounded pt-1 max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-start space-x-2 pl-1 pr-1">
                    {!isReply && !quotedPost ? <SelectionComponent
                        onSelection={onSelection}
                        selected={selected}
                        optionsNodes={optionsNodes}
                        options={["Post", "Artículo", "Tema"]}
                        className={"flex space-x-2"}
                    /> : <div>{emptyChar}</div>}
                    <CloseButton size="small" onClose={onClose}/>
                </div>
                {selected == "Post" && <WritePost
                    onClose={onClose}
                    replyTo={replyTo}
                    selection={selection}
                    quotedPost={quotedPost}
                    setHidden={setHidden}
                    handleSubmit={handleSubmit}
                />}
                {selected == "Tema" && <CreateTopic onClose={onClose}/>}
            </div>
        </BaseFullscreenPopup>
    )
};


export default WritePanelPanel;
