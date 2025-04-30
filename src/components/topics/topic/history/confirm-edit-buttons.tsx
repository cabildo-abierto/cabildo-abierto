import { ATProtoStrongRef } from "@/lib/types"
import {useState} from "react";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import {ReactionButton} from "@/components/feed/frame/reaction-button";
import {RejectVersionModal} from "./reject-version-modal";
import {post} from "@/utils/fetch";
import {getDidFromUri, getRkeyFromUri} from "@/utils/uri";


// TO DO: Si votó reject advertir que lo va a eliminar
async function acceptEdit(id: string, ref: ATProtoStrongRef){
    return await post<{}, {}>(`/vote-edit/accept/${id}/${getDidFromUri(ref.uri)}/${getRkeyFromUri(ref.uri)}/${ref.cid}`)
}


async function cancelVote(id: string, uri: string){
    return await post<{}, {}>(`/cancel-edit-vote/${id}/${getRkeyFromUri(uri)}`)
}


export const ConfirmEditButtons = ({topicId, versionRef, acceptUri, rejectUri, acceptCount, rejectCount}: {
    topicId: string
    versionRef: ATProtoStrongRef
    acceptUri?: string
    rejectUri?: string
    acceptCount: number
    rejectCount: number
}) => {
    const [openRejectModal, setOpenRejectModal] = useState<boolean>(false)
    const [loading, setLoading] = useState(false)

    async function onAcceptEdit(){
        setLoading(true)
        console.log("accepting edit")
        const {error} = await acceptEdit(topicId, versionRef)
        if(error) return {error}
        // mutate("/api/topic/"+topicId)
        // mutate("/api/topic-history/"+topicId)
        setLoading(false)
        return {}
    }

    async function onCancelAcceptEdit(){
        setLoading(true)
        const {error} = await cancelVote(topicId, acceptUri)
        setLoading(false)
        if(error) return {error}
        // mutate("/api/topic/"+topicId)
        // mutate("/api/topic-history/"+topicId)
        setLoading(false)
        return {}
    }

    async function onCancelRejectEdit(){
        setLoading(true)
        const {error} = await cancelVote(topicId, rejectUri)
        setLoading(false)
        if(error) return {error}
        // mutate("/api/topic/"+topicId)
        // mutate("/api/topic-history/"+topicId)
        return {}
    }

    return <div className="flex space-x-2" onClick={(e) => {e.preventDefault(); e.stopPropagation()}}>
        <ReactionButton
            onClick={acceptUri ? onCancelAcceptEdit : onAcceptEdit}
            active={acceptUri != null}
            iconActive={<span className={"text-green-400"}><CheckIcon fontSize={"inherit"}/></span>}
            iconInactive={<CheckIcon fontSize={"inherit"}/>}
            count={acceptCount}
            title={"Aceptar versión."}
            disabled={loading}
        />
        <ReactionButton
            onClick={rejectUri ? onCancelRejectEdit : () => {setOpenRejectModal(true)}}
            active={rejectUri != null}
            iconActive={<span className={"text-red-400"}><ClearIcon fontSize={"inherit"}/></span>}
            iconInactive={<ClearIcon fontSize={"inherit"} color={"inherit"}/>}
            count={rejectCount}
            title={"Rechazar versión."}
            disabled={loading}
        />
        <RejectVersionModal
            onClose={() => {setOpenRejectModal(false)}}
            open={openRejectModal}
            topicId={topicId}
            versionRef={versionRef}
        />
    </div>
}



