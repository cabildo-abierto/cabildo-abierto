"use client"
import Link from "next/link"
import LoadingSpinner from "./loading-spinner"
import ReadOnlyEditor from "./editor/read-only-editor";
import { PostTitleOnFeed } from "./post-on-feed";
import { useContent } from "../app/hooks/contents";
import { decompress } from "./compression";
import DeleteIcon from '@mui/icons-material/Delete';
import StateButton from "./state-button";
import { deleteDraft } from "../actions/contents";
import { useSWRConfig } from "swr";
import { Button } from "@mui/material";
import { WriteButtonIcon } from "./icons";



export const DraftButton: React.FC<{draftId: string}> = ({draftId}) => {
    const {content, isLoading, isError} = useContent(draftId)
    const {mutate} = useSWRConfig()
    
    if(isLoading) return <LoadingSpinner/>

    if(isError || !content) return <></>

    async function onDelete(){
        const {error} = await deleteDraft(draftId)
        await mutate("/api/drafts")
        return {error}
    }

    const title = content.type != "Post" ? undefined : (content.title && content.title.length > 0 ? content.title : "Sin título")

    return <div className="">
        <div className="content-container w-full rounded">
            <div className="px-2 py-2 content flex flex-col">
                {content.type == "Post" && <PostTitleOnFeed title={title}/>}
                <ReadOnlyEditor initialData={decompress(content.compressedText)} content={content}/>
            </div>
        </div>
        <div className="flex justify-end mt-1 mr-1 space-x-2">
            <StateButton
                handleClick={onDelete}
                startIcon={<DeleteIcon/>}
                color="error"
                variant="contained"
                text1="Borrar"
                text2="Borrando..."
                size="small"
                disableElevation={true}
            />
            <Link href={"/editar/"+draftId}>
                <Button variant="contained" color="primary" size="small" disableElevation={true} sx={{textTransform: "none"}} startIcon={<WriteButtonIcon/>}>Editar</Button>
            </Link>
        </div>
    </div>
}