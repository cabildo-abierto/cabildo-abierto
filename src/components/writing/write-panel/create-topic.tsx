import React, {useState} from "react";
import {useRouter} from "next/navigation";
import {topicUrl} from "@/utils/uri";
import Link from "next/link";
import {ErrorMsg} from "@/utils/utils";
import TickButton from "../../../../modules/ui-utils/src/tick-button";
import StateButton from "../../../../modules/ui-utils/src/state-button";
import {getTopicTitle, validEntityName} from "@/components/topics/topic/utils";
import {useSession} from "@/queries/useSession";
import {Button} from "../../../../modules/ui-utils/src/button";
import {post} from "@/utils/fetch";
import {CreateTopicVersionProps} from "@/components/topics/topic/topic-content-expanded-view";
import {useQueryClient} from "@tanstack/react-query";
import {searchTopics} from "../../../../modules/ca-lexical-editor/src/plugins/FloatingLinkEditorPlugin";
import LoadingSpinner from "../../../../modules/ui-utils/src/loading-spinner";
import {CheckCircleIcon, MagnifyingGlassIcon} from "@phosphor-icons/react";
import {IconButton} from "../../../../modules/ui-utils/src/icon-button";
import {ArCabildoabiertoWikiTopicVersion} from "@/lex-api/index"

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
    onBack,
    disabled
}: {
    onBack: () => void
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
            {results != "loading" && topicName.length > 0 && <IconButton
                onClick={() => {
                    search(topicName)
                }}
                size={"small"}
                color={"background-dark2"}
            >
                <MagnifyingGlassIcon weight={"bold"} color={"var(--text-light)"}/>
            </IconButton>}
            {results == "loading" && <div>
                <LoadingSpinner size={"16px"}/>
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
            {onBack && <Button
                onClick={onBack}
                variant={"text"}
                color={"transparent"}
                size={"small"}
                sx={{
                    ":hover": {
                        backgroundColor: "var(--background-dark3)"
                    }
                }}
            >
                <span className={"text-[var(--text-light)]"}>
                    Volver
                </span>
            </Button>}
            <StateButton
                handleClick={onSubmit}
                disabled={disabled}
                size={"small"}
                textClassName="px-4"
                variant={"outlined"}
                color={"background-dark"}
                text1="Crear tema"
            />
        </div>
    </div>
}


export const CreateTopicResults = ({results, topicName}: {results: CreateTopicSearchResults, topicName: string}) => {
    return <div className={"text-[var(--text-light)] text-sm"}>
        {results != "loading" && results && results.length > 0 && <div className={"space-y-1"}>
                <span className={"text-xs font-light"}>
                    Los siguientes temas mencionan <span className={"font-semibold"}>{`"${topicName}"`}</span> en su título.
                </span>
            <div className={"space-y-1 flex flex-col max-h-[250px] custom-scrollbar overflow-y-scroll pb-2"}>
                {results.map(r => {
                    return <Link href={topicUrl(r.id, undefined, "normal")} key={r.id}
                                 className={"border border-[var(--text-light)] hover:bg-[var(--background-dark)] px-2 py-1"}>
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
                          }: {
    topicName: string
    setTopicName: (t: string) => void
    results: CreateTopicSearchResults
    setResults: (v: CreateTopicSearchResults) => void
    disabled: boolean
    goToArticle: boolean
    setGoToArticle: (v: boolean) => void
}) => {
    return <div className={"h-full space-y-3"}>
        <div className={"w-full"}>
            <input
                value={topicName}
                onChange={(e) => {
                    setTopicName(e.target.value);
                    setResults(null)
                }}
                placeholder="Título del tema..."
                autoFocus={true}
                className={"border-[var(--text-lighter)] border w-full bg-[var(--background)] py-1 px-2 text-base outline-none"}
            />
        </div>
        {topicName.includes("/") && <ErrorMsg text="El nombre no puede incluír el caracter '/'."/>}

        {!disabled && <CreateTopicResults
            topicName={topicName}
            results={results}
        />}

        <TickButton
            ticked={goToArticle}
            setTicked={setGoToArticle}
            size={20}
            color="var(--background-dark5)"
            text={<div className="text-sm text-[var(--text-light)]">
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
        <div className={"flex space-x-8 h-full"}>
            <Link href={"/temas?view=lista"} onClick={onClose}>
                <Button
                    variant={"outlined"}
                    sx={{
                        width: "150px",
                        borderRadius: 0
                    }}
                >
                    <span>Editar un tema</span>
                </Button>
            </Link>
            <Button
                variant={"outlined"}
                onClick={() => {
                    setSelected("new")
                }}
                sx={{
                    width: "150px",
                    borderRadius: 0
                }}
            >
                <span className={""}>Nuevo tema</span>
            </Button>
        </div>
    </div>
}


type CreateTopicProps = {
    onClose: () => void
    initialSelected?: string
    backButton?: boolean
}

export const CreateTopic = ({onClose, initialSelected = "none", backButton = true}: CreateTopicProps) => {
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

    return <div className="space-y-3 p-4 flex-grow flex flex-col justify-between">
        <CreateTopicInput
            disabled={disabled}
            topicName={topicName}
            results={results}
            setResults={setResults}
            setTopicName={setTopicName}
            goToArticle={goToArticle}
            setGoToArticle={setGoToArticle}
        />
        <CreateTopicButtons
            results={results}
            onClose={onClose}
            topicName={topicName}
            goToArticle={goToArticle}
            disabled={disabled}
            setResults={setResults}
            onBack={backButton ? () => {setSelected("none")} : undefined}
        />
    </div>
}