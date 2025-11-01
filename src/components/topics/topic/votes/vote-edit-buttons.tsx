import {ATProtoStrongRef, Session} from "@/lib/types"
import React, {useState} from "react";
import {ReactionButton} from "@/components/feed/frame/reaction-button";
import {RejectVersionModal} from "./reject-version-modal";
import {post} from "@/utils/fetch";
import {getDidFromUri, getRkeyFromUri, splitUri} from "@/utils/uri";
import {QueryClient, useMutation, useQueryClient} from "@tanstack/react-query";
import {invalidateQueries, updateTopicHistories} from "@/queries/mutations/updates";
import {produce} from "immer";
import {CheckIcon, XIcon} from "@phosphor-icons/react";
import {ArCabildoabiertoWikiTopicVersion} from "@/lex-api";
import {useSession} from "@/queries/getters/useSession";
import {areArraysEqual} from "@/utils/arrays";
import {useLoginModal} from "@/components/layout/login-modal-provider";
import {useErrors} from "@/components/layout/error-context";
import {ConfirmDeleteVoteModal} from "@/components/topics/topic/votes/confirm-delete-vote-modal";
import {BaseButtonProps} from "@/components/layout/base/baseButton";


// TO DO: Si votó reject advertir que lo va a eliminar
async function acceptEdit(ref: ATProtoStrongRef) {
    return await post<{}, {
        uri: string
    }>(`/vote-edit/accept/${getDidFromUri(ref.uri)}/${getRkeyFromUri(ref.uri)}/${ref.cid}`)
}


async function cancelVote({voteUri, force}: { voteUri: string, force: boolean }) {
    const {collection, rkey} = splitUri(voteUri)
    return await post<{ force: boolean }, {}>(`/cancel-edit-vote/${collection}/${rkey}`, {force})
}


export function addVoteToStatus(status: ArCabildoabiertoWikiTopicVersion.TopicView["status"], user: Session, kind: "accept" | "reject") {
    return produce(status, draft => {
        const cat = draft.voteCounts.find(c => c.category == user.editorStatus)
        if (!cat) {
            draft.voteCounts.push({
                category: user.editorStatus,
                accepts: kind == "accept" ? 1 : 0,
                rejects: kind == "reject" ? 1 : 0,
            })
        } else {
            if (kind == "accept") cat.accepts++; else cat.rejects++;
        }
    })
}


export function removeVoteFromStatus(status: ArCabildoabiertoWikiTopicVersion.TopicView["status"], user: Session, kind: "accept" | "reject") {
    return produce(status, draft => {
        const cat = draft.voteCounts.find(c => c.category == user.editorStatus)
        if (cat) {
            if (kind == "accept") {
                if (cat.accepts > 0) cat.accepts--;
            } else {
                if (cat.rejects > 0) cat.rejects--;
            }
        }
    })
}


function updateTopicViewAndVersion(qc: QueryClient, topicId: string, topicVersionUri: string, updater: (v: ArCabildoabiertoWikiTopicVersion.TopicView) => ArCabildoabiertoWikiTopicVersion.TopicView) {
    const {did, rkey} = splitUri(topicVersionUri)
    const queries: string[][] = [
        ["topic", topicId],
        ["topic", did, rkey],
        ["topic-version", did, rkey]
    ]

    qc.getQueryCache().getAll()
        .filter(q => Array.isArray(q.queryKey) && queries.some(k => areArraysEqual(k, q.queryKey as string[])))
        .forEach(q => {
            qc.setQueryData(q.queryKey, old => {
                if (!old) return old
                const topic = old as ArCabildoabiertoWikiTopicVersion.TopicView
                return updater(topic)
            })
        })
}


function optimisticAcceptVote(qc: QueryClient, topicId: string, uri: string, user: Session) {
    updateTopicHistories(qc, uri, e => {
        if (!e) return
        return produce(e, draft => {
            if (!draft.viewer) {
                draft.viewer = {}
            }
            draft.status = addVoteToStatus(draft.status, user, "accept")
            draft.viewer.accept = "optimistic-accept-uri"
        })
    })

    function updater(v: ArCabildoabiertoWikiTopicVersion.TopicView) {
        return produce(v, draft => {
            draft.viewer.accept = "optimistic-accept-uri"
            draft.status = addVoteToStatus(draft.status, user, "accept")
        })
    }

    updateTopicViewAndVersion(qc, topicId, uri, updater)
}


export function optimisticRejectVote(qc: QueryClient, topicId: string, uri: string, user: Session) {
    updateTopicHistories(qc, uri, e => {
        return produce(e, draft => {
            draft.viewer.reject = "optimistic-reject-uri"
            draft.status = addVoteToStatus(draft.status, user, "reject")
        })
    })

    function updater(v: ArCabildoabiertoWikiTopicVersion.TopicView) {
        return produce(v, draft => {
            draft.viewer.reject = "optimistic-reject-uri"
            draft.status = addVoteToStatus(draft.status, user, "reject")
        })
    }

    updateTopicViewAndVersion(qc, topicId, uri, updater)
}


export function setCreatedRejectVote(qc: QueryClient, topicId: string, uri: string, voteUri: string) {
    updateTopicHistories(qc, uri, e => {
        return produce(e, draft => {
            draft.viewer.reject = voteUri
        })
    })

    function updater(v: ArCabildoabiertoWikiTopicVersion.TopicView) {
        return produce(v, draft => {
            draft.viewer.reject = voteUri
        })
    }

    updateTopicViewAndVersion(qc, topicId, uri, updater)
}


function setCreatedAcceptVote(qc: QueryClient, topicId: string, uri: string, voteUri: string) {
    updateTopicHistories(qc, uri, e => {
        return produce(e, draft => {
            draft.viewer.accept = voteUri
        })
    })

    function updater(v: ArCabildoabiertoWikiTopicVersion.TopicView) {
        return produce(v, draft => {
            draft.viewer.accept = voteUri
        })
    }

    updateTopicViewAndVersion(qc, topicId, uri, updater)
}

function optimisticCancelAcceptVote(qc: QueryClient, topicId: string, uri: string, user: Session) {
    updateTopicHistories(qc, uri, e => {
        return produce(e, draft => {
            draft.viewer.accept = undefined
            draft.status = removeVoteFromStatus(draft.status, user, "accept")
        })
    })

    function updater(v: ArCabildoabiertoWikiTopicVersion.TopicView) {
        return produce(v, draft => {
            draft.viewer.accept = undefined
            draft.status = removeVoteFromStatus(draft.status, user, "accept")
        })
    }

    updateTopicViewAndVersion(qc, topicId, uri, updater)

}

function optimisticCancelRejectVote(qc: QueryClient, topicId: string, uri: string, user: Session) {
    updateTopicHistories(qc, uri, e => {
        return produce(e, draft => {
            draft.viewer.reject = undefined
            draft.status = removeVoteFromStatus(draft.status, user, "reject")
        })
    })

    function updater(v: ArCabildoabiertoWikiTopicVersion.TopicView) {
        return produce(v, draft => {
            return produce(v, draft => {
                draft.viewer.reject = undefined
                draft.status = removeVoteFromStatus(draft.status, user, "reject")
            })
        })
    }

    updateTopicViewAndVersion(qc, topicId, uri, updater)
}


export function invalidateQueriesAfterVoteUpdate(qc: QueryClient, subjectId: string, topicId: string) {
    const queriesToInvalidate: string[][] = []

    const {did, rkey} = splitUri(subjectId)

    queriesToInvalidate.push(["topic", topicId])
    queriesToInvalidate.push(["topic", did, rkey])
    queriesToInvalidate.push(["topic-version", did, rkey])
    queriesToInvalidate.push(["topic-history", topicId])
    queriesToInvalidate.push(["votes", subjectId])
    queriesToInvalidate.push(["topic-discussion", subjectId])

    invalidateQueries(qc, queriesToInvalidate)
}


export const VoteEditButtons = ({
                                    topicId,
                                    versionRef,
                                    acceptUri,
                                    rejectUri,
                                    acceptCount,
                                    rejectCount,
                                    iconSize
                                }: {
    topicId: string
    versionRef: ATProtoStrongRef
    acceptUri?: string
    rejectUri?: string
    acceptCount: number
    rejectCount: number
    iconSize?: BaseButtonProps["size"]
}) => {
    const [openRejectModal, setOpenRejectModal] = useState<boolean>(false)
    const qc = useQueryClient()
    const {user} = useSession()
    const {setLoginModalOpen} = useLoginModal()
    const {addError} = useErrors()
    const [openConfirmDeleteVote, setOpenConfirmDeleteVote] = useState<boolean>(false)

    const acceptEditMutation = useMutation({
        mutationFn: acceptEdit,
        onMutate: () => {
            optimisticAcceptVote(qc, topicId, versionRef.uri, user)
        },
        onSuccess: (data) => {
            if (data.data.uri) {
                setCreatedAcceptVote(qc, topicId, versionRef.uri, data.data.uri)
                invalidateQueriesAfterVoteUpdate(qc, versionRef.uri, topicId)
            }
        }
    })

    const cancelAcceptEditMutation = useMutation({
        mutationFn: cancelVote,
        onMutate: () => {
            optimisticCancelAcceptVote(qc, topicId, versionRef.uri, user)
        },
        onSuccess: async () => {
            invalidateQueriesAfterVoteUpdate(qc, versionRef.uri, topicId)
        },
    })

    const cancelRejectEditMutation = useMutation({
        mutationFn: cancelVote,
        onMutate: () => {
        },
        onSuccess: async (data) => {
            if (data.error) {
                if (data.error.includes("borraría la justificación")) {
                    setOpenConfirmDeleteVote(true)
                } else {
                    addError(data.error)
                }
            } else {
                optimisticCancelRejectVote(qc, topicId, versionRef.uri, user)
                invalidateQueriesAfterVoteUpdate(qc, versionRef.uri, topicId)
            }
        }
    })

    async function onAcceptEdit() {
        if (!user) {
            setLoginModalOpen(true)
        } else {
            acceptEditMutation.mutate(versionRef)
        }
        return {}
    }

    function onCancelAcceptEdit() {
        cancelAcceptEditMutation.mutate({voteUri: acceptUri, force: false})
        return {}
    }

    function onCancelRejectEdit() {
        cancelRejectEditMutation.mutate({voteUri: rejectUri, force: false})
    }

    const isAuthor = user && getDidFromUri(versionRef.uri) == user.did

    return <div className="flex space-x-2" onClick={(e) => {
        e.preventDefault();
        e.stopPropagation()
    }}>
        <ReactionButton
            onClick={acceptUri ? onCancelAcceptEdit : onAcceptEdit}
            active={acceptUri != null}
            iconActive={<span className={"text-green-400"}><CheckIcon/></span>}
            iconInactive={<CheckIcon/>}
            count={acceptCount}
            hideZero={acceptCount + rejectCount == 0}
            title={isAuthor ? "Vos escribiste esta versión." : "Aceptar versión."}
            textClassName={"text-[13px] font-light"}
            iconSize={iconSize}
            disabled={acceptUri == "optimistic-accept-uri" || isAuthor}
        />
        <ReactionButton
            onClick={rejectUri ? () => {
                onCancelRejectEdit()
            } : () => {
                if (user) setOpenRejectModal(true); else setLoginModalOpen(true);
            }}
            active={rejectUri != null}
            iconActive={<span className={"text-red-400"}><XIcon/></span>}
            iconInactive={<XIcon/>}
            iconSize={iconSize}
            count={rejectCount}
            hideZero={acceptCount + rejectCount == 0}
            textClassName={"text-[13px] font-light"}
            title={isAuthor ? "Vos escribiste esta versión." : "Rechazar versión."}
            disabled={rejectUri == "optimistic-reject-uri" || isAuthor}
        />
        {user && <RejectVersionModal
            onClose={() => {
                setOpenRejectModal(false)
            }}
            open={openRejectModal}
            topicId={topicId}
            versionRef={versionRef}
        />}
        {user && openConfirmDeleteVote && <ConfirmDeleteVoteModal
            onConfirm={async () => {
                const res = await cancelRejectEditMutation.mutateAsync({voteUri: rejectUri, force: true})
                return {error: res.error}
            }}
            onClose={() => {
                setOpenConfirmDeleteVote(false)
            }}
        />}
    </div>
}



