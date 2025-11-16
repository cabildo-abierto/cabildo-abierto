import {StateButton} from "@/components/utils/base/state-button"
import React, {useCallback, useEffect, useState} from "react";
import {
    CreateTopicResults,
    CreateTopicSearchResults,
    useCreateTopic
} from "../writing/write-panel/create-topic";
import {useQueryClient} from "@tanstack/react-query";
import {LoadingSpinner} from "@/components/utils/base/loading-spinner";
import {useTopicPageParams} from "./use-topic-page-params";
import Link from "next/link";
import {topicUrl} from "@/components/utils/react/url";
import {BaseButton} from "@/components/utils/base/base-button";
import {queryTopics} from "@/components/writing/query-topics";


export default function TopicNotFoundPage() {
    const {did, rkey, topicId: id} = useTopicPageParams()
    const name = decodeURIComponent(id).replaceAll("_", " ")
    const qc = useQueryClient()
    const [results, setResults] = useState<CreateTopicSearchResults>(null)
    const {createTopic} = useCreateTopic()

    const onSubmit = useCallback(async () => {
        const {error} = await createTopic(id)
        if (error) return {error}
        qc.refetchQueries({queryKey: ["topic", id]})

        return {}
    }, [id])

    async function search(v: string) {
        setResults("loading")
        const topics = await queryTopics(v);
        setResults(topics)
    }

    useEffect(() => {
        if (results == null && id) {
            search(id)
        }
    }, [results, id])


    if (did && rkey && id) {
        return <div className={"flex flex-col items-center space-y-6"}>
            <div className="flex justify-center space-y-3 mt-32 px-6 flex-col items-center text-center">
                <h2 className={"uppercase text-lg"}>No se encontró esta versión del tema</h2>
                <h2 className={"text-lg text-[var(--text-light)]"}>{'"' + id + '"'}</h2>
            </div>
            <div>
                <Link href={topicUrl(id)}>
                    <BaseButton size={"small"} variant={"outlined"}>
                        Ir a la versión actual
                    </BaseButton>
                </Link>
            </div>
        </div>
    } else if(!id) {
        return <div className={"flex flex-col items-center space-y-6"}>
            <div className="flex justify-center space-y-3 mt-32 px-6 flex-col items-center text-center">
                <h2 className={"uppercase text-lg"}>No se encontró esta versión del tema</h2>
            </div>
            <div>
                <Link href={"/inicio"}>
                    <BaseButton size={"small"} variant={"outlined"}>
                        Ir al inicio
                    </BaseButton>
                </Link>
            </div>
        </div>
    }


    return <div className={"flex flex-col items-center space-y-6"}>
        <div className="flex justify-center space-y-3 mt-32 px-6 flex-col items-center text-center">
            <h2 className={"uppercase text-lg"}>No se encontró el tema</h2>
            <h2 className={"text-lg text-[var(--text-light)]"}>{'"' + name + '"'}</h2>
        </div>

        {results == "loading" && <div>
            <LoadingSpinner/>
        </div>}

        {results != null && results.length > 0 && <CreateTopicResults results={results} topicName={id}/>}

        <StateButton
            handleClick={onSubmit}
            size={"small"}
            textClassName="px-4"
            variant={"outlined"}
        >
            Crear tema
        </StateButton>
    </div>
}