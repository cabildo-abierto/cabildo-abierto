"use client"

import { NotFoundPage } from "../../components/ui-utils/not-found-page"
import { useUser } from "../../hooks/user"

import React, {useState} from 'react';
import { tomasDid } from "../../components/utils/utils"
import StateButton from "../../components/ui-utils/state-button";
import {
    applyReferencesUpdateToContent,
    getPendingReferenceUpdatesCount,
    getPendingSynonymsUpdatesCount, resetUpdateReferenceTimestamps,
    updateReferences,
    updateTopicsSynonyms
} from "../../actions/topic/references";
import {updateTopicsCategories} from "../../actions/topic/categories";
import {updateTopicPopularityScores} from "../../actions/topic/popularity";



export default function Page() {
    const {user} = useUser()
    const [pendingSynonymsUpdates, setPendingSynonymsUpdates] = useState(null)
    const [pendingContentReferenceUpdates, setPendingContentReferenceUpdates] = useState(null)

    if(!user || (user.editorStatus != "Administrator" && user.did != tomasDid)){
        return <NotFoundPage/>
    }

    const uri = "at://did:plc:jcnfx7zrmnbzzljbzl4docmm/app.bsky.feed.post/3lckyxs4q2226"

    let center = <div className="flex flex-col items-center mt-8">
        <h1>Panel de administrador</h1>
        <div className="py-8 flex flex-col items-center space-y-2 w-64 text-center">

            <h2>Contenidos</h2>

            <StateButton
                handleClick={async () => {
                    await updateReferences()
                    return {}
                }}
                text1={"Actualizar todas las referencias"}
            />

            <StateButton
                handleClick={async () => {
                    const p = await getPendingReferenceUpdatesCount()
                    setPendingContentReferenceUpdates(p)
                    return {}
                }}
                text1={"Referencias pendientes?"}
            />

            <div>
                Referencias pendientes {pendingContentReferenceUpdates}
            </div>

            <StateButton
                handleClick={async () => {
                    await updateTopicsSynonyms()
                    return {}
                }}
                text1={"Actualizar sinónimos"}
            />

            <StateButton
                handleClick={async () => {
                    const p = await getPendingSynonymsUpdatesCount()
                    setPendingSynonymsUpdates(p)
                    return {}
                }}
                text1={"Sinónimos pendientes?"}
            />

            <div>
                Sinónimos pendientes {pendingSynonymsUpdates}
            </div>


            <StateButton
                handleClick={async () => {
                    await resetUpdateReferenceTimestamps()
                    return {}
                }}
                text1={"Resetear timestamps referencias y sinónimos"}
            />

            <StateButton
                handleClick={async () => {
                    await applyReferencesUpdateToContent(uri)
                    return {}
                }}
                text1={"Actualizar referencias de " + uri}
            />

            <h2>Popularidad</h2>

            <StateButton
                handleClick={async () => {
                    await updateTopicPopularityScores()
                    return {}
                }}
                text1={"Actualizar popularidad de temas"}
            />

            <h2>Categorías</h2>

            <StateButton
                handleClick={async () => {
                    await updateTopicsCategories()
                    return {}
                }}
                text1={"Actualizar categorías de temas"}
            />

        </div>
    </div>

    return center
}