import React, {useState} from "react";
import {useRouter} from "next/navigation";
import {topicUrl} from "@/components/utils/react/url";
import Link from "next/link";
import {ErrorMsg} from "../../utils/utils";
import TickButton from "../../utils/tick-button";
import {StateButton} from "@/components/utils/base/state-button"
import {getTopicTitle, validEntityName} from "../../tema/utils";
import {useSession} from "@/components/auth/use-session";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {LoadingSpinner} from "@/components/utils/base/loading-spinner";
import {ArCabildoabiertoWikiTopicVersion, CreateTopicVersionProps} from "@cabildo-abierto/api"
import {BaseTextField} from "@/components/utils/base/base-text-field";
import {queryTopics} from "@/components/writing/query-topics";
import {post} from "@/components/utils/react/fetch";
import {cn} from "@/lib/utils";
import {useDebounce} from "@/components/utils/react/debounce";


export function useCreateTopic() {

    const createTopic = async (id: string) => {
        id = id.trim()
        const topic: CreateTopicVersionProps = {
            id,
            props: [
                {
                    $type: "ar.cabildoabierto.wiki.topicVersion#topicProp",
                    name: "Sinónimos",
                    value: {
                        $type: "ar.cabildoabierto.wiki.topicVersion#stringListProp",
                        value: [id]
                    }
                }
            ]
        }

        return await post<CreateTopicVersionProps, {}>(`/topic-version`, topic)
    }

    return {createTopic}
}


export type CreateTopicSearchResults = ArCabildoabiertoWikiTopicVersion.TopicViewBasic[] | "loading" | null


const CreateTopicButtons = ({
                                topicName,
                                goToArticle,
                                onClose,
                                disabled,
    setGoToArticle
                            }: {
    topicName: string
    goToArticle: boolean
    onClose: () => void
    disabled: boolean
    setGoToArticle: (v: boolean) => void
}) => {
    const {createTopic} = useCreateTopic()
    const router = useRouter()
    const qc = useQueryClient()

    async function onSubmit() {
        const res = await createTopic(topicName)

        if (res.success === false) {
            if (res.error == "exists") {
                return {error: "El tema ya existe."}
            } else {
                return {error: res.error}
            }
        }

        qc.refetchQueries({queryKey: ["topic", topicName]})

        if (goToArticle) router.push(topicUrl(topicName))
        onClose()
        return {}
    }

    return <div className="space-x-2 w-full flex justify-between items-center">
        <TickButton
            ticked={goToArticle}
            setTicked={setGoToArticle}
            size={20}
            color="var(--text-light)"
            text={<div className="text-xs font-light">
                Ir a la página del tema después de crearlo
            </div>}
        />
        <div className={"space-x-2"}>
            <StateButton
                handleClick={onSubmit}
                disabled={disabled}
                size={"small"}
                variant={"outlined"}
            >
                Crear tema
            </StateButton>
        </div>
    </div>
}


export const CreateTopicResults = ({results, topicName, onClickTopic}: {
    results: CreateTopicSearchResults
    topicName: string
    onClickTopic?: () => void
}) => {
    return <div className={"text-[var(--text)] text-sm"}>
        {results != "loading" && results && results.length > 0 && <div className={"space-y-1"}>
            <div className={"space-y-1 flex flex-col max-h-[250px] custom-scrollbar overflow-y-scroll pb-2"}>
                {results.map(r => {
                    return <Link
                        href={topicUrl(r.id)}
                        key={r.id}
                        onClick={onClickTopic}
                        className={"border border-[var(--accent-dark)] hover:bg-[var(--background-dark2)] px-2 py-1"}
                    >
                        {getTopicTitle(r)}
                    </Link>
                })}
            </div>
        </div>}
    </div>
}


const CreateTopicInput = ({
                              topicName,
                              setTopicName,
                              disabled,
                              goToArticle,
                              setGoToArticle,
                              onClose
                          }: {
    topicName: string
    setTopicName: (t: string) => void
    disabled: boolean
    goToArticle: boolean
    setGoToArticle: (v: boolean) => void
    onClose: () => void
}) => {
    const debouncedName = useDebounce(topicName, 300)
    async function search(v: string) {
        return await queryTopics(v)
    }

    const { data: results, isLoading } = useQuery({
        queryKey: ['search', "Temas", debouncedName],
        queryFn: () => search(debouncedName),
        enabled: debouncedName.length > 0
    });

    return <div className={"h-full space-y-1"}>
        <div className={"w-full"}>
            <BaseTextField
                value={topicName}
                onChange={(e) => {
                    setTopicName(e.target.value)
                }}
                placeholder="Escribí un título para el tema o buscá uno que ya exista..."
                autoFocus={true}
                inputClassName={"py-2"}
                inputGroupClassName={"bg-[var(--background-dark)]"}
            />
        </div>
        {topicName.includes("/") && <ErrorMsg text="El nombre no puede incluír el caracter '/'."/>}

        {results && results.length > 0 && <div className={"text-xs font-light px-0.5 py-1"}>
            Se encontraron {results.length} temas. Si alguno es lo que estás buscando, editalo en vez de crear uno nuevo.
        </div>}

        {!disabled && <CreateTopicResults
            topicName={topicName}
            results={results}
            onClickTopic={onClose}
        />}

        <div className={"flex space-x-1 items-center"}>
            {isLoading && <div>
                <LoadingSpinner className={"w-4 h-4"}/>
            </div>}
            {!isLoading && results && results.length == 0 && <div
                className={"flex space-x-1 text-center text-xs font-light pl-1"}
            >
                No se encontraron temas similares, creá el tema para empezar la discusión.
            </div>}
        </div>
    </div>
}


type CreateTopicProps = {
    onClose: () => void
    onMenu: boolean
}

export const CreateTopic = ({
    onClose,
    onMenu
                            }: CreateTopicProps) => {
    const user = useSession();
    const [topicName, setTopicName] = useState("");
    const [goToArticle, setGoToArticle] = useState(true)

    const disabled = !user.user || !validEntityName(topicName)

    return <div className={cn("space-y-3 px-2 pb-2 flex-grow flex flex-col justify-between min-h-[250px]", onMenu && "pt-12")}>
        <CreateTopicInput
            disabled={disabled}
            topicName={topicName}
            setTopicName={setTopicName}
            goToArticle={goToArticle}
            setGoToArticle={setGoToArticle}
            onClose={onClose}
        />
        <CreateTopicButtons
            onClose={onClose}
            topicName={topicName}
            goToArticle={goToArticle}
            disabled={disabled}
            setGoToArticle={setGoToArticle}
        />
    </div>
}