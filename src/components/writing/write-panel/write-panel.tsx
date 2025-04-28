import React, {useState} from "react"
import {BaseFullscreenPopup} from "../../../../modules/ui-utils/src/base-fullscreen-popup"
import {CloseButton} from "../../../../modules/ui-utils/src/close-button"
import SelectionComponent from "@/components/buscar/search-selection-component";
import {Button} from "@mui/material";
import {useRouter} from "next/navigation";
import {CreateTopic} from "./create-topic";
import {WritePost} from "./write-post";
import {$Typed} from "@atproto/api";
import {ArticleView, FullArticleView, PostView} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {WritePanelReply} from "@/components/writing/write-panel/write-panel-reply";
import {TopicView} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";


export type ReplyToContent = $Typed<PostView> | $Typed<ArticleView> | $Typed<FullArticleView> | $Typed<TopicView>


type WritePanelProps = {
    replyTo?: ReplyToContent
    open: boolean
    onClose: () => void
    selection?: [number, number]
    onSubmit?: () => Promise<void>
}


export const WritePanel = ({
                               replyTo,
                               open,
                               onClose,
                               selection,
                               onSubmit = async () => {}
                           }: WritePanelProps) => {
    const [selected, setSelected] = useState("Post")
    const router = useRouter()

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
                    backgroundColor: isSelected ? "var(--background-dark)" : "transparent",
                    ":hover": {
                        backgroundColor: "var(--background-dark)"
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
        } else {
            setSelected(o)
        }
    }

    return (
        <BaseFullscreenPopup open={open} className="w-full max-w-[512px]">
            <div className="w-full rounded pt-1 border max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-start space-x-2 pl-1 pr-1">
                    {isReply && <WritePanelReply
                        replyTo={replyTo}
                        selection={selection}
                    />}
                    {!isReply && <SelectionComponent
                        onSelection={onSelection}
                        selected={selected}
                        optionsNodes={optionsNodes}
                        options={["Post", "Artículo", "Tema"]}
                        className={"flex space-x-2"}
                    />}
                    <CloseButton size="small" onClose={onClose}/>
                </div>
                {selected == "Post" && <WritePost
                    onClose={onClose}
                    replyTo={replyTo}
                    selection={selection}
                    onSubmit={onSubmit}
                />}
                {selected == "Tema" && <CreateTopic onClose={onClose}/>}
            </div>
        </BaseFullscreenPopup>
    )
};

