import React from 'react';
import {ATProtoStrongRef} from "@cabildo-abierto/api";
import {useSession} from "@/components/auth/use-session";
import {
    invalidateQueriesAfterVoteUpdate,
    optimisticRejectVote, setCreatedRejectVote
} from "./vote-edit-buttons";
import {getDidFromUri, getRkeyFromUri} from '@cabildo-abierto/utils';
import {post} from "../../utils/react/fetch";
import {useQueryClient} from "@tanstack/react-query";
import {CreatePostProps} from "@cabildo-abierto/api";
import WritePanelPanel from "@/components/writing/write-panel/write-panel-panel";


async function rejectEdit({ref, reason, force}: { ref: ATProtoStrongRef, force: boolean, reason: CreatePostProps }) {
    return await post<{ reason: CreatePostProps, force: boolean }, { uri: string, postUri: string }>(
        `/vote-edit/reject/${getDidFromUri(ref.uri)}/${getRkeyFromUri(ref.uri)}/${ref.cid}`,
        {
            reason,
            force
        }
    )
}

export const RejectVersionModal = ({open, onClose, topicId, versionRef}: {
    open: boolean
    onClose: () => void
    versionRef: ATProtoStrongRef
    topicId: string
}) => {
    const {user} = useSession()
    const qc = useQueryClient()

    const onReject = async (p: CreatePostProps, force: boolean) => {
        const res = await rejectEdit({
            ref: versionRef,
            reason: p,
            force
        })
        if(res.success === false) return {error: res.error ?? "Ocurrió un error al enviar el voto."}
        optimisticRejectVote(qc, topicId, versionRef.uri, user)
        setCreatedRejectVote(qc, topicId, versionRef.uri, res.value.uri)
        invalidateQueriesAfterVoteUpdate(qc, versionRef.uri, topicId)
        return {}
    }

    return <WritePanelPanel
        replyTo={{$type: "com.atproto.repo.strongRef", ...versionRef}}
        isVoteReject={true}
        open={open}
        onClose={onClose}
        handleSubmit={async (p) => {
            const res = await onReject(p, false)
            onClose()
            return res
        }}
        className={"z-[1502]"}
    />
}