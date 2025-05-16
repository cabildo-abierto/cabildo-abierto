import { ATProtoStrongRef } from "@/lib/types"
import {useState} from "react";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import {ReactionButton} from "@/components/feed/frame/reaction-button";
import {RejectVersionModal} from "./reject-version-modal";
import {post} from "@/utils/fetch";
import {getDidFromUri, getRkeyFromUri, splitUri} from "@/utils/uri";
import {QueryClient, useMutation, useQueryClient} from "@tanstack/react-query";
import {contentQueriesFilter, updateTopicHistories} from "@/queries/updates";
import {produce} from "immer";


// TO DO: Si votó reject advertir que lo va a eliminar
async function acceptEdit(ref: ATProtoStrongRef){
    return await post<{}, {uri: string}>(`/vote-edit/accept/${getDidFromUri(ref.uri)}/${getRkeyFromUri(ref.uri)}/${ref.cid}`)
}


async function cancelVote(voteUri: string){
    const {collection, rkey} = splitUri(voteUri)
    return await post<{}, {}>(`/cancel-edit-vote/${collection}/${rkey}`)
}


function optimisticAcceptVote(qc: QueryClient, uri: string) {
    updateTopicHistories(qc, uri, e => {
        return produce(e, draft => {
            draft.viewer.accept = "optimistic-accept-uri"
            draft.status.voteCounts[0].accepts ++
        })
    })
}


function setCreatedAcceptVote(qc: QueryClient, uri: string, voteUri: string) {
    updateTopicHistories(qc, uri, e => {
        return produce(e, draft => {
            draft.viewer.accept = voteUri
        })
    })
}

function optimisticCancelAcceptVote(qc: QueryClient, uri: string) {
    updateTopicHistories(qc, uri, e => {
        return produce(e, draft => {
            draft.viewer.accept = undefined
            draft.status.voteCounts[0].accepts--
        })
    })
}

function optimisticCancelRejectVote(qc: QueryClient, uri: string) {
    updateTopicHistories(qc, uri, e => {
        return produce(e, draft => {
            draft.viewer.reject = undefined
            draft.status.voteCounts[0].rejects--
        })
    })
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
    const qc = useQueryClient()

    const acceptEditMutation = useMutation({
        mutationFn: acceptEdit,
        onMutate: (likedContent) => {
            qc.cancelQueries(contentQueriesFilter(versionRef.uri))
            optimisticAcceptVote(qc, versionRef.uri)
        },
        onSuccess: (data, variables, context) => {
            if (data.data.uri) {
                setCreatedAcceptVote(qc, versionRef.uri, data.data.uri)
            }
        },
        onSettled: async () => {
            qc.invalidateQueries(contentQueriesFilter(versionRef.uri))
        },
    })

    const cancelAcceptEditMutation = useMutation({
        mutationFn: cancelVote,
        onMutate: (likedContent) => {
            qc.cancelQueries(contentQueriesFilter(versionRef.uri))
            optimisticCancelAcceptVote(qc, versionRef.uri)
        },
        onSettled: async () => {
            qc.invalidateQueries(contentQueriesFilter(versionRef.uri))
        },
    })

    const cancelRejectEditMutation = useMutation({
        mutationFn: cancelVote,
        onMutate: (likedContent) => {
            qc.cancelQueries(contentQueriesFilter(versionRef.uri))
            optimisticCancelRejectVote(qc, versionRef.uri)
        },
        onSettled: async () => {
            qc.invalidateQueries(contentQueriesFilter(versionRef.uri))
        },
    })

    async function onAcceptEdit(){
        acceptEditMutation.mutate(versionRef)
        return {}
    }

    async function onCancelAcceptEdit(){
        cancelAcceptEditMutation.mutate(acceptUri)
        return {}
    }

    async function onCancelRejectEdit(){
        cancelRejectEditMutation.mutate(rejectUri)
    }

    return <div className="flex space-x-2" onClick={(e) => {e.preventDefault(); e.stopPropagation()}}>
        <ReactionButton
            onClick={acceptUri ? onCancelAcceptEdit : onAcceptEdit}
            active={acceptUri != null}
            iconActive={<span className={"text-green-400"}><CheckIcon fontSize={"inherit"}/></span>}
            iconInactive={<CheckIcon fontSize={"inherit"}/>}
            count={acceptCount}
            title={"Aceptar versión."}
            disabled={acceptUri == "optimistic-accept-uri"}
        />
        <ReactionButton
            onClick={rejectUri ? onCancelRejectEdit : () => {setOpenRejectModal(true)}}
            active={rejectUri != null}
            iconActive={<span className={"text-red-400"}><ClearIcon fontSize={"inherit"}/></span>}
            iconInactive={<ClearIcon fontSize={"inherit"} color={"inherit"}/>}
            count={rejectCount}
            title={"Rechazar versión."}
            disabled={rejectUri == "optimistic-reject-uri"}
        />
        <RejectVersionModal
            onClose={() => {setOpenRejectModal(false)}}
            open={openRejectModal}
            topicId={topicId}
            versionRef={versionRef}
        />
    </div>
}



