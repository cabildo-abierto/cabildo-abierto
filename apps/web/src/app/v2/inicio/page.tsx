"use client"

import {LoadingSpinner} from "@/components/utils/base/loading-spinner";
import {useTopics} from "@/queries/getters/useTopics";
import {getTopicTitle} from "@/components/tema/utils";
import {type MouseEvent, useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {
    bringTopicToFront,
    defaultFloatingTopicHeight,
    defaultFloatingTopicWidth,
    FloatingTopic,
    getFloatingTopicInitialPosition,
    getTopicPageHref,
    type OpenTopic
} from "@/components/v2/floating-topic";
import {SearchBar} from "@/components/utils/base/search-bar";
import {useDebounce} from "@/components/utils/react/debounce";
import {get} from "@/components/utils/react/fetch";
import {ArCabildoabiertoWikiTopicVersion} from "@cabildo-abierto/api";
import {PlusIcon} from "@phosphor-icons/react";
import {BaseButton} from "@/components/utils/base/base-button";
import {createPortal} from "react-dom";
import CreateTopicModal from "@/components/tema/create-topic-modal";

type TopicViewBasic = ArCabildoabiertoWikiTopicVersion.TopicViewBasic

const topicListClassName = "[column-width:200px] [column-gap:128px] pt-12 pr-4 px-1"
const topicButtonClassName = "mb-4 leading-tight block w-full break-inside-avoid text-left hover:text-[var(--text-light)] tracking-tighter"

async function searchTopics(q: string) {
    return await get<TopicViewBasic[]>(`/search-topics/${encodeURIComponent(q)}`)
}

const TopicList = ({topics, onOpenTopic}: {
    topics: TopicViewBasic[]
    onOpenTopic: (topicId: string, e: MouseEvent<HTMLButtonElement>) => void
}) => {
    return <div className={topicListClassName}>
        {topics.map(t => (<button
            key={t.id}
            onClick={e => onOpenTopic(t.id, e)}
            className={topicButtonClassName}
        >
            {getTopicTitle(t)}
        </button>))}
    </div>
}

export default function Page() {
    const {data, isLoading} = useTopics([], "popular", "all", 1000)
    const [openTopics, setOpenTopics] = useState<OpenTopic[]>([])
    const [searchValue, setSearchValue] = useState("")
    const [searching, setSearching] = useState(false)
    const [searchResults, setSearchResults] = useState<TopicViewBasic[]>([])
    const [searchLoading, setSearchLoading] = useState(false)
    const [searchError, setSearchError] = useState(false)
    const debouncedSearchValue = useDebounce(searchValue.trim(), 300)
    const router = useRouter()
    const activeSearch = searchValue.trim().length > 0
    const searchWaitingForDebounce = searchValue.trim() != debouncedSearchValue
    const showSearchLoading = searchValue.trim().length > 0 && (searchWaitingForDebounce || searchLoading)
    const [newTopicOpen, setNewTopicOpen] = useState(false)

    useEffect(() => {
        let cancelled = false

        async function runSearch() {
            if(debouncedSearchValue.length == 0) {
                setSearchResults([])
                setSearchLoading(false)
                setSearchError(false)
                return
            }

            setSearchLoading(true)
            setSearchError(false)
            const res = await searchTopics(debouncedSearchValue)
            if(cancelled) return

            setSearchLoading(false)
            if(res.success) {
                setSearchResults(res.value)
            } else {
                setSearchResults([])
                setSearchError(true)
            }
        }

        runSearch()

        return () => {
            cancelled = true
        }
    }, [debouncedSearchValue])

    const openTopic = (topicId: string, e: MouseEvent<HTMLButtonElement>) => {
        if(e.shiftKey) {
            router.push(getTopicPageHref(topicId))
            return
        }

        setOpenTopics(openTopics => {
            if(openTopics.some(t => t.topicId == topicId)) {
                return bringTopicToFront(openTopics, topicId)
            }

            const {x, y} = getFloatingTopicInitialPosition(e.clientX, e.clientY)

            return bringTopicToFront([
                ...openTopics,
                {
                    topicId,
                    x,
                    y,
                    width: defaultFloatingTopicWidth,
                    height: defaultFloatingTopicHeight,
                    zIndex: 0
                }
            ], topicId)
        })
    }

    const updateOpenTopic = (topicId: string, changes: Partial<OpenTopic>) => {
        setOpenTopics(openTopics => openTopics.map(ot => ot.topicId == topicId ? {...ot, ...changes} : ot))
    }

    const bringOpenTopicToFront = (topicId: string) => {
        setOpenTopics(openTopics => bringTopicToFront(openTopics, topicId))
    }

    return <div className={""}>
        <div className={"p-2 flex space-x-2"}>
            <div>
            <SearchBar
                autoFocus
                searchValue={searchValue}
                setSearchValue={setSearchValue}
                searching={activeSearch}
                setSearching={setSearching}
                placeholder={"Buscar temas"}
                allowCloseWithNoText
                inputGroupClassName={"max-w-80 border-none"}
                inputClassName={"tracking-tighter"}
            />
            </div>
            <BaseButton
                startIcon={<PlusIcon/>}
                className={"py-2 px-1"}
                size={"small"}
                onClick={() => {
                    setNewTopicOpen(true)
                }}
                id={"new-topic-button"}
            >
                <span className={"hidden min-[600px]:block"}>Tema</span>
                <span className={"block min-[600px]:hidden"}>Tema</span>
            </BaseButton>
        </div>

        {activeSearch ? <div key={"search"}>
            {searchValue.trim().length == 0 && <div className={"pt-24 pr-4 text-center text-sm text-[var(--text-light)]"}>
                Buscá un tema
            </div>}
            {showSearchLoading && <div className={"py-32 flex justify-center"}><LoadingSpinner/></div>}
            {searchValue.trim().length > 0 && !showSearchLoading && searchError && <div className={"pt-24 pr-4 text-center text-sm text-[var(--text-light)]"}>
                Ocurrió un error al buscar.
            </div>}
            {searchValue.trim().length > 0 && !showSearchLoading && !searchError && searchResults.length == 0 && <div className={"pt-24 pr-4 text-center text-sm text-[var(--text-light)]"}>
                No se encontraron temas.
            </div>}
            {searchValue.trim().length > 0 && !showSearchLoading && !searchError && searchResults.length > 0 && <TopicList
                topics={searchResults}
                onOpenTopic={openTopic}
            />}
        </div> : <>
            {isLoading && <div className={"py-64 flex justify-center"}><LoadingSpinner/></div>}
            {data && <TopicList topics={data} onOpenTopic={openTopic}/>}
        </>}

        {openTopics.map(t => <FloatingTopic
            key={t.topicId}
            openTopic={t}
            updateOpenTopic={updateOpenTopic}
            onActivate={bringOpenTopicToFront}
            onClose={() => setOpenTopics(openTopics.filter(ot => ot.topicId != t.topicId))}
        />)}

        {newTopicOpen && createPortal(<CreateTopicModal
            open={newTopicOpen}
            onClose={() => setNewTopicOpen(false)}
            onMenu={false}
        />, document.body)}
    </div>
}
