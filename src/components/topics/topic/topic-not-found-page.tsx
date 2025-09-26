import StateButton from "../../../../modules/ui-utils/src/state-button";
import React, {useEffect, useState} from "react";
import {createTopic, CreateTopicResults, CreateTopicSearchResults} from "@/components/writing/write-panel/create-topic";
import {useQueryClient} from "@tanstack/react-query";
import {searchTopics} from "../../../../modules/ca-lexical-editor/src/plugins/FloatingLinkEditorPlugin";
import LoadingSpinner from "../../../../modules/ui-utils/src/loading-spinner";


export default function TopicNotFoundPage({id}: { id: string }) {
    const name = decodeURIComponent(id).replaceAll("_", " ")
    const qc = useQueryClient()
    const [results, setResults] = useState<CreateTopicSearchResults>(null)

    async function onSubmit() {
        const {error} = await createTopic(id)
        if(error) return {error}
        qc.refetchQueries({queryKey: ["topic", id]})

        return {}
    }

    async function search(v: string) {
        setResults("loading")
        const topics = await searchTopics(v);
        setResults(topics)
    }

    useEffect(() => {
        if(results == null){
            search(id)
        }
    }, [results])


    return <div className={"flex flex-col items-center space-y-3"}>
        <div className="flex justify-center space-y-3 mt-32 px-6 flex-col items-center text-center">
            <h2 className={"uppercase text-lg"}>No se encontró el tema</h2>
            <h2 className={"text-lg text-[var(--text-light)]"}>{'"' + name + '"'}</h2>
        </div>

        {results == "loading" && <div>
            <LoadingSpinner/>
        </div>}

        <CreateTopicResults results={results} topicName={id}/>

        <StateButton
            handleClick={onSubmit}
            size={"small"}
            textClassName="px-4"
            variant={"outlined"}
            color={"background-dark"}
            text1="Crear tema"
        />
    </div>
}