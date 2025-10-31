import React, {useState} from "react";
import {useRouter} from "next/navigation";
import {topicUrl} from "@/utils/uri";
import Link from "next/link";
import {ErrorMsg} from "@/utils/utils";
import TickButton from "../../layout/utils/tick-button";
import StateButton from "../../layout/utils/state-button";
import {getTopicTitle, validEntityName} from "@/components/topics/topic/utils";
import {useSession} from "@/queries/getters/useSession";
import {BaseButton} from "../../layout/base/baseButton";
import {post} from "@/utils/fetch";
import {useQueryClient} from "@tanstack/react-query";
import {searchTopics} from "../../../../modules/ca-lexical-editor/src/plugins/FloatingLinkEditorPlugin";
import LoadingSpinner from "../../layout/base/loading-spinner";
import {CheckCircleIcon, MagnifyingGlassIcon} from "@phosphor-icons/react";
import {BaseIconButton} from "../../layout/base/base-icon-button";
import {ArCabildoabiertoWikiTopicVersion} from "@/lex-api/index"
import {CreateTopicVersionProps} from "@/components/topics/topic/editing/save-edit-button";
import {BaseTextField} from "@/components/layout/base/base-text-field";

export const createTopic = async (id: string) => {
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


export type CreateTopicSearchResults = ArCabildoabiertoWikiTopicVersion.TopicViewBasic[] | "loading" | null


const CreateTopicButtons = ({
    setResults,
    topicName,
    goToArticle,
    onClose,
    results,
    disabled
}: {
    topicName: string
    goToArticle: boolean
    onClose: () => void
    disabled: boolean
    results: CreateTopicSearchResults
    setResults: (v: CreateTopicSearchResults) => void
}) => {
    const router = useRouter()
    const qc = useQueryClient()

    async function search(v: string) {
        setResults("loading")
        const topics = await searchTopics(v);
        setResults(topics)
    }

    async function onSubmit() {
        const {error} = await createTopic(topicName)

        if (error) {
            if (error == "exists") {
                return {error: "El tema ya existe."}
            } else {
                return {error}
            }
        }

        qc.refetchQueries({queryKey: ["topic", topicName]})

        if (goToArticle) router.push(topicUrl(topicName))
        onClose()
        return {}
    }

    return <div className="space-x-2 text-[var(--text-light)] w-full flex justify-between items-center">
        <div className={"flex space-x-1 items-center"}>
            {results != "loading" && topicName.length > 0 && <BaseIconButton
                onClick={() => {
                    search(topicName)
                }}
                size={"small"}
            >
                <MagnifyingGlassIcon weight={"bold"} color={"var(--text-light)"}/>
            </BaseIconButton>}
            {results == "loading" && <div>
                <LoadingSpinner className={"w-4 h-4"}/>
            </div>}
            {results != "loading" && results && results.length == 0 && <div
                className={"flex space-x-1 text-center"}
            >
                <div className={"text-xs"}>
                    No se encontraron temas similares.
                </div>
                <CheckCircleIcon weight={"fill"}/>
            </div>}
        </div>
        <div className={"space-x-2"}>
            <StateButton
                handleClick={onSubmit}
                disabled={disabled}
                size={"default"}
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
                <span className={"text-xs font-light"}>
                    Los siguientes temas mencionan <span className={"font-semibold"}>{`"${topicName}"`}</span> en su título.
                </span>
            <div className={"space-y-1 flex flex-col max-h-[250px] custom-scrollbar overflow-y-scroll pb-2"}>
                {results.map(r => {
                    return <Link
                        href={topicUrl(r.id, undefined, "normal")}
                        key={r.id}
                        onClick={onClickTopic}
                        className={"border border-[var(--accent-dark)] hover:bg-[var(--background-dark)] px-2 py-1"}
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
    results,
    setResults,
    disabled,
    goToArticle,
    setGoToArticle,
    onClose
                          }: {
    topicName: string
    setTopicName: (t: string) => void
    results: CreateTopicSearchResults
    setResults: (v: CreateTopicSearchResults) => void
    disabled: boolean
    goToArticle: boolean
    setGoToArticle: (v: boolean) => void
    onClose: () => void
}) => {
    return <div className={"h-full space-y-3"}>
        <div className={"w-full"}>
            <BaseTextField
                value={topicName}
                onChange={(e) => {
                    setTopicName(e.target.value);
                    setResults(null)
                }}
                placeholder="Título del tema..."
                autoFocus={true}
                inputClassName={"text-base py-1.5 px-3"}
                inputGroupClassName={"bg-[var(--background-dark)]"}
            />
        </div>
        {topicName.includes("/") && <ErrorMsg text="El nombre no puede incluír el caracter '/'."/>}

        {!disabled && <CreateTopicResults
            topicName={topicName}
            results={results}
            onClickTopic={onClose}
        />}

        <TickButton
            ticked={goToArticle}
            setTicked={setGoToArticle}
            size={20}
            color="var(--text-light)"
            text={<div className="text-sm">
                Ir a la página del tema después de crearlo
            </div>}
        />
    </div>
}


const CreateTopicOptions = ({
    onClose,
    setSelected

                            }: {
    onClose: () => void
    setSelected: (v: string) => void
}) => {
    return <div className={"flex justify-center items-center min-h-64 flex-grow "}>
        <div className={"flex space-x-8 h-full items-center"}>
            <Link href={"/temas?view=lista"} onClick={onClose}>
                <BaseButton
                    variant={"outlined"}
                    className={"w-[150px]"}
                >
                    Editar un tema
                </BaseButton>
            </Link>
            <BaseButton
                variant={"outlined"}
                onClick={() => {
                    setSelected("new")
                }}
                className={"w-[150px]"}
            >
                Nuevo tema
            </BaseButton>
        </div>
    </div>
}


type CreateTopicProps = {
    onClose: () => void
    initialSelected?: string
}

export const CreateTopic = ({
                                onClose,
                                initialSelected = "none"
}: CreateTopicProps) => {
    const user = useSession();
    const [topicName, setTopicName] = useState("");
    const [goToArticle, setGoToArticle] = useState(true)
    const [selected, setSelected] = useState(initialSelected)
    const [results, setResults] = useState<CreateTopicSearchResults>(null)

    if (selected == "none") {
        return <CreateTopicOptions
            onClose={onClose}
            setSelected={setSelected}
        />
    }

    const disabled = !user.user || !validEntityName(topicName)

    return <div className="space-y-3 p-4 flex-grow flex flex-col justify-between min-h-[250px]">
        <CreateTopicInput
            disabled={disabled}
            topicName={topicName}
            results={results}
            setResults={setResults}
            setTopicName={setTopicName}
            goToArticle={goToArticle}
            setGoToArticle={setGoToArticle}
            onClose={onClose}
        />
        <CreateTopicButtons
            results={results}
            onClose={onClose}
            topicName={topicName}
            goToArticle={goToArticle}
            disabled={disabled}
            setResults={setResults}
        />
    </div>
}