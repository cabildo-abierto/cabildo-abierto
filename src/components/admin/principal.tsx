"use client"
import React, {useState} from "react";
import StateButton from "../../../modules/ui-utils/src/state-button";
import {
    applyReferencesUpdateToContent,
    getPendingReferenceUpdatesCount,
    getPendingSynonymsUpdatesCount, resetUpdateReferenceTimestamps,
    updateReferences,
    updateTopicsSynonyms
} from "@/server-actions/topic/references";
import {updateTopicPopularityScores} from "@/server-actions/topic/popularity";
import {updateTopicsCategories} from "@/server-actions/topic/categories";
import {
    updateTopicCurrentVersion,
    updateTopicsCurrentVersion,
    updateTopicsLastEdit
} from "@/server-actions/topic/current-version";
import {AdminSection} from "./admin-section";
import {updateCategoriesGraph} from "@/server-actions/topic/graph";
import {expandURI} from "@/utils/uri";
import {updateThreadsInFeed} from "@/server-actions/feed/thread-in-feed";


export const AdminPrincipal = () => {
    const [pendingSynonymsUpdates, setPendingSynonymsUpdates] = useState(null)
    const [pendingContentReferenceUpdates, setPendingContentReferenceUpdates] = useState(null)
    const [uri, setUri] = useState("")
    const [topicId, setTopicId] = useState("")


    let center = <div className="flex flex-col items-center mt-8">

        <div className="py-8 flex flex-col items-center space-y-2 w-64 text-center">

            <AdminSection title={"URI"}>
                <input
                    value={uri}
                    onChange={(e) => {setUri(e.target.value)}}
                    placeholder={"uri"}
                    className={"p-2 w-128 outline-none"}
                />
            </AdminSection>
            <AdminSection title={"Topic ID"}>
                <input
                    value={topicId}
                    onChange={(e) => {setTopicId(e.target.value)}}
                    placeholder={"topic id"}
                    className={"p-2 w-128 outline-none"}
                />
            </AdminSection>

            <AdminSection title={"Referencias"}>

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
                        await applyReferencesUpdateToContent(expandURI(uri))
                        return {}
                    }}
                    text1={"Actualizar referencias URI"}
                />

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

            </AdminSection>

            <AdminSection title={"Popularidad"}>
                <StateButton
                    handleClick={async () => {
                        await updateTopicPopularityScores()
                        return {}
                    }}
                    text1={"Actualizar popularidad de temas"}
                />

                <StateButton
                    handleClick={async () => {
                        await updateTopicsLastEdit()
                        return {}
                    }}
                    text1={"Actualizar fecha última edición"}
                />
            </AdminSection>

            <AdminSection title={"Categorías"}>

                <StateButton
                    handleClick={async () => {
                        await updateTopicsCategories()
                        return {}
                    }}
                    text1={"Actualizar categorías de temas"}
                />

                <StateButton
                    handleClick={async () => {
                        await updateCategoriesGraph()
                        return {}
                    }}
                    text1={"Actualizar grafo de categorías"}
                />
            </AdminSection>

            <AdminSection title={"Versión actual"}>

                <StateButton
                    handleClick={async () => {
                        await updateTopicsCurrentVersion()
                        return {}
                    }}
                    text1={"Actualizar versión actual de temas"}
                />
            </AdminSection>

            <AdminSection title={"Versión actual"}>

                <StateButton
                    handleClick={async () => {
                        await updateTopicCurrentVersion(topicId)
                        return {}
                    }}
                    text1={`Actualizar versión actual de ${topicId}`}
                />
            </AdminSection>


            <AdminSection title={"Threads"}>

                <StateButton
                    handleClick={async () => {
                        await updateThreadsInFeed()
                        return {}
                    }}
                    text1={`Actualizar threads en feed`}
                />
            </AdminSection>
        </div>
    </div>

    return center
}