"use client"
import {useUser} from "../../hooks/user";
import React, {useState} from "react";
import {NotFoundPage} from "../ui-utils/not-found-page";
import StateButton from "../ui-utils/state-button";
import {
    getPendingReferenceUpdatesCount,
    getPendingSynonymsUpdatesCount, resetUpdateReferenceTimestamps,
    updateReferences,
    updateTopicsSynonyms
} from "../../actions/topic/references";
import {updateTopicPopularityScores} from "../../actions/topic/popularity";
import {updateTopicsCategories} from "../../actions/topic/categories";
import {updateTopicsLastEdit} from "../../actions/topic/current-version";
import {AdminSection} from "./admin-section";


export const AdminPrincipal = () => {
    const [pendingSynonymsUpdates, setPendingSynonymsUpdates] = useState(null)
    const [pendingContentReferenceUpdates, setPendingContentReferenceUpdates] = useState(null)


    let center = <div className="flex flex-col items-center mt-8">

        <div className="py-8 flex flex-col items-center space-y-2 w-64 text-center">

            <AdminSection title={"Contenidos"}>

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
                {pendingContentReferenceUpdates && <div>
                    Referencias pendientes {pendingContentReferenceUpdates}
                </div>}

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
                {pendingSynonymsUpdates && <div>
                    Sinónimos pendientes {pendingSynonymsUpdates}
                </div>}

                <StateButton
                    handleClick={async () => {
                        await resetUpdateReferenceTimestamps()
                        return {}
                    }}
                    text1={"Resetear timestamps referencias y sinónimos"}
                />

                <StateButton
                    handleClick={async () => {
                        await updateTopicPopularityScores()
                        return {}
                    }}
                    text1={"Actualizar popularidad de temas"}
                />

                <StateButton
                    handleClick={async () => {
                        await updateTopicsCategories()
                        return {}
                    }}
                    text1={"Actualizar categorías de temas"}
                />
                <StateButton
                    handleClick={async () => {
                        await updateTopicsLastEdit()
                        return {}
                    }}
                    text1={"Actualizar fecha última edición"}
                />

            </AdminSection>

        </div>
    </div>

    return center
}