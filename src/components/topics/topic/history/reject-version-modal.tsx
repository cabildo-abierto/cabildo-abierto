import React, { useState } from 'react';
import TickButton from '../../../../../modules/ui-utils/src/tick-button';
import StateButton from '../../../../../modules/ui-utils/src/state-button';
import InfoPanel from '../../../../../modules/ui-utils/src/info-panel';
import { BaseFullscreenPopup } from '../../../../../modules/ui-utils/src/base-fullscreen-popup';
import {TextField} from "@mui/material";
import {ATProtoStrongRef} from "@/lib/types";
import {post} from "@/utils/fetch";
import {getDidFromUri, getRkeyFromUri} from "@/utils/uri";
import {QueryClient, useMutation, useQueryClient} from "@tanstack/react-query";
import {contentQueriesFilter, updateTopicHistories} from "@/queries/updates";
import {produce} from "immer";


export function validExplanation(text: string) {
    return text.length > 0
}


async function rejectEdit({ref, message, labels}: {ref: ATProtoStrongRef, message: string, labels: string[]}){
    return await post<{message: string, labels: string[]}, {uri: string}>(
        `/vote-edit/reject/${getDidFromUri(ref.uri)}/${getRkeyFromUri(ref.uri)}/${ref.cid}`,
        {
            message,
            labels
        }
    )
}


const RejectLabelTick = ({label, info, labels, title, setLabels}: {label: string, info: string, labels: string[], setLabels: (v: string[]) => void, title: string}) => {
    const text = <div className="flex space-x-2 text-sm text-[var(--text-light)]">
        <div>{title}</div>
        <InfoPanel text={info} className="w-72"/>
    </div>

    return <TickButton
        text={text}
        setTicked={(v: boolean) => {if(v) setLabels([...labels, label]); else setLabels(labels.filter(l => l != label))}}
        ticked={labels.includes(label)}
        size={20}
        color="#455dc0"
    />
}


function optimisticRejectVote(qc: QueryClient, uri: string) {
    updateTopicHistories(qc, uri, e => {
        return produce(e, draft => {
            draft.viewer.reject = "optimistic-reject-uri"
            draft.status.voteCounts[0].rejects ++
        })
    })
}


function setCreatedRejectVote(qc: QueryClient, uri: string, voteUri: string) {
    updateTopicHistories(qc, uri, e => {
        return produce(e, draft => {
            draft.viewer.reject = voteUri
        })
    })
}


export const RejectVersionModal = ({ open, onClose, topicId, versionRef }: {
    open: boolean
    onClose: () => void
    versionRef: ATProtoStrongRef
    topicId: string
}) => {
    const [message, setMessage] = useState("")
    const [labels, setLabels] = useState([])
    const qc = useQueryClient()

    const rejectEditMutation = useMutation({
        mutationFn: rejectEdit,
        onMutate: (likedContent) => {
            qc.cancelQueries(contentQueriesFilter(versionRef.uri))
            optimisticRejectVote(qc, versionRef.uri)
            onClose()
        },
        onSuccess: (data, variables, context) => {
            if (data.data.uri) {
                setCreatedRejectVote(qc, versionRef.uri, data.data.uri)
            }
        },
        onSettled: async () => {
            qc.invalidateQueries(contentQueriesFilter(versionRef.uri))
        },
    })

    const onReject = async () => {
        rejectEditMutation.mutate({ref: versionRef, message, labels})
        return {}
    }

    return <BaseFullscreenPopup open={open} closeButton={true} onClose={onClose}>
        <div className="space-y-6 px-6 pt-2 mb-4 flex flex-col items-center min-w-96">
            <h3>
                Rechazar versión
            </h3>
            <div className="w-full">
                <TextField
                    size={"small"}
                    label={"Motivo"}
                    minRows={4}
                    multiline={true}
                    fullWidth={true}
                    value={message}
                    onChange={(e) => {setMessage(e.target.value)}}
                    placeholder="Explicá por qué te parece necesario deshacer este cambio."
                />
            </div>
            <div className="w-full flex flex-col space-y-2">
                <RejectLabelTick
                    label={"vandalismo"}
                    info={"Si te parece que empeoró la calidad del contenido intencionalmente."}
                    labels={labels}
                    setLabels={setLabels}
                    title={"Marcar como vandalismo"}
                />
                <RejectLabelTick
                    label={"oportunismo"}
                    info={"Si te parece que intentó obtener un rédito económico desproporcionado con respecto a la mejora que representa en el contenido."}
                    labels={labels}
                    setLabels={setLabels}
                    title={"Marcar como oportunismo"}
                />
            </div>
            <div className="">
                <StateButton
                    handleClick={onReject}
                    disabled={!validExplanation(message)}
                    disableElevation={true}
                    text1="Confirmar"
                    textClassName={"font-semibold text-[13px]"}
                />
            </div>
        </div>
    </BaseFullscreenPopup>
}