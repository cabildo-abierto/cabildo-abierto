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

type CreateTopicProps = {
    onClose: () => void
    initialSelected?: string
    backButton?: boolean
}

export const CreateTopic = ({onClose, initialSelected = "none", backButton = true}: CreateTopicProps) => {
    const user = useSession();
    const [topicName, setTopicName] = useState("");
    const [errorOnCreate, setErrorOnCreate] = useState(null)
    const router = useRouter()
    const [goToArticle, setGoToArticle] = useState(true)
    const [selected, setSelected] = useState(initialSelected)
    const qc = useQueryClient()
    const [results, setResults] = useState<ArCabildoabiertoWikiTopicVersion.TopicViewBasic[] | "loading" | null>(null)

    async function search(v: string) {
        setResults("loading")
        const topics = await searchTopics(v);
        setResults(topics)
    }

    async function onSubmit() {
        setErrorOnCreate(null)
        const {error} = await createTopic(topicName)

        if (error) {
            if (error == "exists") {
                setErrorOnCreate("Ya existe ese tema.")
                return {}
            } else {
                return {error}
            }
        }

        qc.refetchQueries({queryKey: ["topic", topicName]})

        if (goToArticle) router.push(topicUrl(topicName))
        onClose()
        return {}
    }

    if (selected == "none") {
        return <div className={"flex justify-center items-center min-h-64"}>
            <div className={"flex space-x-8 h-full"}>
                <Link href={"/temas?view=lista"} onClick={onClose}>
                    <Button
                        sx={{
                            width: "150px",
                            borderRadius: 0
                        }}
                    >
                        <span className={""}>Editar un tema</span>
                    </Button>
                </Link>
                <Button
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

    const disabled = !user.user || !validEntityName(topicName)

    return <div className="space-y-3 px-6 mb-2 flex flex-col min-h-[200px] max-w-[400px] justify-between">
        <div className={"space-y-3"}>
            <div className={"mt-6 w-full"}>
                <input
                    value={topicName}
                    onChange={(e) => {
                        setTopicName(e.target.value);
                        setResults(null)
                    }}
                    placeholder="Título del tema..."
                    autoFocus={true}
                    className={"border w-full bg-[var(--background)] p-2 font-semibold text-lg outline-none"}
                />
            </div>
            {errorOnCreate && <ErrorMsg text={errorOnCreate}/>}
            {topicName.includes("/") && <ErrorMsg text="El nombre no puede incluír el caracter '/'."/>}

            {!disabled && <div className={"text-[var(--text-light)] text-sm"}>
                {results != "loading" && results && results.length > 0 && <div className={"space-y-1"}>
                <span className={"text-xs"}>
                    Los siguientes temas mencionan <span className={"font-semibold"}>{`"${topicName}"`}</span> en su título.
                </span>
                    <div className={"space-y-1 flex flex-col max-h-[250px] overflow-y-scroll"}>
                        {results.map(r => {
                            return <Link href={topicUrl(r.id, undefined, "normal")} key={r.id}
                                         className={"bg-[var(--background-dark2)] hover:bg-[var(--background-dark3)] rounded-lg px-2 py-1"}>
                                {getTopicTitle(r)}
                            </Link>
                        })}
                    </div>
                </div>}
            </div>}


            <TickButton
                ticked={goToArticle}
                setTicked={setGoToArticle}
                size={20}
                color="#455dc0"
                text={<div className="text-sm text-[var(--text-light)]">
                    Ir a la página del tema después de crearlo
                </div>}
            />
        </div>

        <div className="py-4 space-x-2 text-[var(--text-light)] w-full flex justify-between items-center">
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
                {backButton && <Button
                    onClick={() => {
                        setSelected("none")
                    }}
                    variant={"text"}
                    color={"background-dark"}
                    sx={{
                        ":hover": {
                            backgroundColor: "var(--background-dark3)"
                        }
                    }}
                >
                <span className={"text-[var(--text-light)] font-semibold"}>
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

    </div>
}