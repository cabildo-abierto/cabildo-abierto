import React, { useState } from "react"
import { useUser } from "../../hooks/user"
import { BaseFullscreenPopup } from "../ui-utils/base-fullscreen-popup"
import { CloseButton } from "../ui-utils/close-button"
import { NeedAccountPopup } from "../auth/need-account-popup"
import SelectionComponent from "../search/search-selection-component";
import {Button} from "@mui/material";
import {useRouter} from "next/navigation";
import {
    emptyChar
} from "../utils/utils";
import {ReplyToContent} from "../editor/plugins/CommentPlugin";
import {ContentQuote, QuotedContent} from "../feed/content-quote";
import {CreateTopic} from "./create-topic";
import {WriteFastPost} from "./write-fast-post";


function quotedContentFromReplyTo(replyTo: ReplyToContent): QuotedContent {
    return {
        ...replyTo,
        author: replyTo.author
    };
}



type Props = {
    replyTo?: ReplyToContent
    open: boolean
    onClose: () => void
    quote?: string
    onSubmit?: () => Promise<void>
}


export const WritePanel = ({
    replyTo,
    open,
    onClose,
    quote,
    onSubmit=async () => {}
}: Props) => {
    const {user} = useUser();
    const [selected, setSelected] = useState("Post")
    const router = useRouter()

    const isReply = replyTo != undefined

    if (!user) {
        return <NeedAccountPopup open={open} text="Necesitás una cuenta para escribir" onClose={onClose}/>
    }

    function optionsNodes(o: string, isSelected: boolean){
        return <div className="text-[var(--text)] text-sm">
            <Button
                onClick={() => {}}
                variant="text"
                color="inherit"
                size={"small"}
                fullWidth={true}
                disableElevation={true}
                sx={{textTransform: "none",
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

    function onSelection(o: string){
        if(o == "Artículo"){
            router.push("/escribir/articulo")
        } else {
            setSelected(o)
        }
    }

    const center = <>
        <div className="flex justify-between items-start space-x-2 pl-1 pr-2">
            {isReply ?
                (replyTo.collection == "ar.com.cabildoabierto.topic" || replyTo.collection == "ar.com.cabildoabierto.article" ?
                    <div className={"w-full mr-4"}>
                        <ContentQuote
                            quotedContent={quotedContentFromReplyTo(replyTo)}
                            quote={quote}
                        />
                    </div> :
                    <div>
                        {emptyChar}
                    </div>) :
                <SelectionComponent
                    onSelection={onSelection}
                    selected={selected}
                    optionsNodes={optionsNodes}
                    options={["Post", "Artículo", "Tema"]}
                    className={"flex space-x-2"}
                />
            }
            <CloseButton size="small" onClose={onClose}/>
        </div>
        {selected == "Post" && <WriteFastPost
            onClose={onClose}
            replyTo={replyTo}
            quote={quote}
            onSubmit={onSubmit}
        />}
        {selected == "Tema" && <CreateTopic onClose={onClose}/>}
    </>

    return <>
        <BaseFullscreenPopup open={open} className="w-128">
            <div className="w-full rounded pb-2 pt-1 border max-h-[80vh] overflow-y-auto">
                {center}
            </div>
        </BaseFullscreenPopup>
    </>
};

