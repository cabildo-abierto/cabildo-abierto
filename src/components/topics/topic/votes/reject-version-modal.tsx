import React from 'react';
import InfoPanel from '../../../layout/utils/info-panel';
import {BaseFullscreenPopup} from '../../../layout/base/base-fullscreen-popup';
import {ATProtoStrongRef} from "@/lib/types";
import {CreatePostProps, WritePost} from "@/components/writing/write-panel/write-post";
import {CloseButton} from "@/components/layout/utils/close-button";
import {useLayoutConfig} from "@/components/layout/layout-config-context";
import {useSession} from "@/queries/getters/useSession";
import {
    invalidateQueriesAfterVoteUpdate,
    optimisticRejectVote, setCreatedRejectVote
} from "@/components/topics/topic/votes/vote-edit-buttons";
import {getDidFromUri, getRkeyFromUri} from '@/utils/uri';
import {post} from "@/utils/fetch";
import {useQueryClient} from "@tanstack/react-query";


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
    const {isMobile} = useLayoutConfig()
    const {user} = useSession()
    const qc = useQueryClient()

    const onReject = async (p: CreatePostProps, force: boolean) => {
        const {error, data} = await rejectEdit({
            ref: versionRef,
            reason: p,
            force
        })
        if(error || !data) return {error: error ?? "Ocurrió un error al enviar el voto."}
        optimisticRejectVote(qc, topicId, versionRef.uri, user)
        setCreatedRejectVote(qc, topicId, versionRef.uri, data.uri)
        invalidateQueriesAfterVoteUpdate(qc, versionRef.uri, topicId)
        return {}
    }

    return <BaseFullscreenPopup open={open} closeButton={false}>
        <div className={"flex flex-col items-center " + (isMobile ? "w-screen" : "w-[500px]")}>
            <div className={"flex justify-between items-center w-full p-1"}>
                <div className={"flex space-x-1 items-center pl-1"}>
                    <h3 className={"text-sm uppercase"}>
                        Rechazar versión
                    </h3>
                    <InfoPanel
                        iconFontSize={16}
                        text={"Se va a agregar un voto de rechazo a esta versión y una publicación en la discusión del tema con tu justificación."}
                    />
                </div>
                <div>
                    <CloseButton onClose={onClose} size={"small"}/>
                </div>
            </div>
            <div className="w-full">
                <WritePost
                    replyTo={{$type: "com.atproto.repo.strongRef", ...versionRef}}
                    onClose={() => {}}
                    setHidden={(v) => {}}
                    handleSubmit={async (p) => {
                        const res = await onReject(p, false)
                        onClose()
                        return res
                    }}
                    isVoteReject={true}
                />
            </div>
        </div>
    </BaseFullscreenPopup>
}