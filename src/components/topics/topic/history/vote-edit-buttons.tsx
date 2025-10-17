import { ATProtoStrongRef } from "@/lib/types"
import {useState} from "react";
import {ReactionButton} from "@/components/feed/frame/reaction-button";
import {RejectVersionModal} from "./reject-version-modal";
import {post} from "@/utils/fetch";
import {getDidFromUri, getRkeyFromUri, splitUri} from "@/utils/uri";
import {QueryClient, useMutation, useQueryClient} from "@tanstack/react-query";
import {contentQueriesFilter, invalidateQueries, updateTopicHistories} from "@/queries/mutations/updates";
import {produce} from "immer";
import {CheckIcon, XIcon} from "@phosphor-icons/react";
import { ArCabildoabiertoWikiTopicVersion } from "@/lex-api";
import { Color } from "@/components/layout/utils/color";
import {darker} from "@/components/layout/utils/button";


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
        if(!e) return
        return produce(e, draft => {
            if(!draft.viewer) {
                draft.viewer = {}
            }
            draft.viewer.accept = "optimistic-accept-uri"
            draft.status.voteCounts[0].accepts ++
        })
    })
    qc.getQueryCache().getAll()
        .filter(q => Array.isArray(q.queryKey) && q.queryKey[0] == "topic" || q.queryKey[0] == "topic-version")
        .forEach(q => {
            qc.setQueryData(q.queryKey, old => {
                if (!old) return old
                const topic = old as ArCabildoabiertoWikiTopicVersion.TopicView
                return produce(topic, draft => {
                    draft.viewer.accept = "optimistic-accept-uri"
                    draft.status.voteCounts[0].accepts ++
                })
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

    qc.getQueryCache().getAll()
        .filter(q => Array.isArray(q.queryKey) && q.queryKey[0] == "topic" || q.queryKey[0] == "topic-version")
        .forEach(q => {
            qc.setQueryData(q.queryKey, old => {
                if (!old) return old
                const topic = old as ArCabildoabiertoWikiTopicVersion.TopicView
                return produce(topic, draft => {
                    draft.viewer.accept = undefined
                    draft.status.voteCounts[0].accepts --
                })
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


function invalidateQueriesAfterVoteUpdate(qc: QueryClient, subjectId: string, topicId: string){
    const queriesToInvalidate: string[][] = []

    const {did, rkey} = splitUri(subjectId)

    queriesToInvalidate.push(["topic", topicId])
    queriesToInvalidate.push(["topic", did, rkey])
    queriesToInvalidate.push(["topic-version", did, rkey])
    queriesToInvalidate.push(["topic-history", topicId])
    queriesToInvalidate.push(["votes", subjectId])

    invalidateQueries(qc, queriesToInvalidate)
}


export const VoteEditButtons = ({
                                    topicId,
                                    versionRef,
                                    acceptUri,
                                    rejectUri,
                                    acceptCount,
                                    rejectCount,
    backgroundColor="background"
}: {
    topicId: string
    versionRef: ATProtoStrongRef
    acceptUri?: string
    rejectUri?: string
    acceptCount: number
    rejectCount: number
    backgroundColor?: Color
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
            invalidateQueriesAfterVoteUpdate(qc, versionRef.uri, topicId)
        },
    })

    const cancelAcceptEditMutation = useMutation({
        mutationFn: cancelVote,
        onMutate: (likedContent) => {
            qc.cancelQueries(contentQueriesFilter(versionRef.uri))
            optimisticCancelAcceptVote(qc, versionRef.uri)
        },
        onSettled: async () => {
            invalidateQueriesAfterVoteUpdate(qc, versionRef.uri, topicId)
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

    const iconFontSize = 20

    return <div className="flex space-x-2" onClick={(e) => {e.preventDefault(); e.stopPropagation()}}>
        <ReactionButton
            onClick={acceptUri ? onCancelAcceptEdit : onAcceptEdit}
            active={acceptUri != null}
            iconActive={<span className={"text-green-400"}><CheckIcon fontSize={iconFontSize}/></span>}
            iconInactive={<CheckIcon fontSize={iconFontSize}/>}
            count={acceptCount}
            hoverColor={darker(darker(backgroundColor))}
            title={"Aceptar versión."}
            textClassName={"text-sm"}
            disabled={acceptUri == "optimistic-accept-uri"}
        />
        <ReactionButton
            onClick={rejectUri ? onCancelRejectEdit : () => {setOpenRejectModal(true)}}
            active={rejectUri != null}
            iconActive={<span className={"text-red-400"}><XIcon fontSize={iconFontSize}/></span>}
            iconInactive={<XIcon fontSize={iconFontSize}/>}
            count={rejectCount}
            hoverColor={darker(darker(backgroundColor))}
            textClassName={"text-sm"}
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



