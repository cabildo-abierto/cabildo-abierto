"use client"
import {LoadingSpinner} from "@/components/utils/base/loading-spinner";
import {Note} from "@/components/utils/base/note";
import SelectionComponent from "@/components/buscar/search-selection-component";
import {useState} from "react";
import {feedOptionNodes} from "@/components/feed/config/feed-option-nodes";
import {BaseTextField} from "@/components/utils/base/base-text-field";
import {useDebounceValue} from "usehooks-ts";
import {FeedConfig, FeedView} from "@cabildo-abierto/api";
import {getFeedLabel} from "@/components/feed/feed/main-feed-header";
import {get} from "@/components/utils/react/fetch";
import {useQuery} from "@tanstack/react-query";
import {PlusIcon} from "@phosphor-icons/react";
import {BaseIconButton} from "@/components/utils/base/base-icon-button";
import BskyRichTextContent from "@/components/feed/post/bsky-rich-text-content";
import {useMainPageFeeds} from "@/components/feed/config/main-page-feeds-context";
import Image from "next/image"
import {profileUrl} from "@cabildo-abierto/utils";
import Link from "next/link";

function getFeedName(feed: FeedView) {
    if (feed.type == "custom") {
        return feed.feed.displayName
    } else {
        return getFeedLabel(feed)
    }
}


function getFeedDescription(feed: FeedView) {
    if (feed.type == "custom") {
        return {
            description: feed.feed.description,
            descriptionFacets: feed.feed.descriptionFacets
        }
    } else if (feed.type == "main") {
        if (feed.subtype == "descubrir") {
            return {
                description: "Publicaciones y artículos según los intereses que elijas."
            }
        } else if (feed.subtype == "discusion") {
            return {
                description: 'Publicaciones y artículos seleccionados como "en discusión" por sus autores. Ordenados cronológicamente o por popularidad.'
            }
        } else if (feed.subtype == "siguiendo") {
            return {
                description: "Publicaciones y artículos de quienes seguís, ordenados cronológicamente."
            }
        }
    } else if(feed.type == "topic") {
        return {
            description: `Menciones al tema ${feed.title}.`
        }
    } else {
        return {}
    }
}


function feedViewToConfig(feed: FeedView): FeedConfig {
    if (feed.type == "custom") {
        return {
            type: "custom",
            subtype: "custom",
            uri: feed.feed.uri,
            displayName: feed.feed.displayName
        }
    } else {
        return feed
    }
}


const FeedPreview = ({feed}: {
    feed: FeedView
}) => {
    const name = getFeedName(feed)
    const {description, descriptionFacets} = getFeedDescription(feed)
    const {addFeed} = useMainPageFeeds()

    return <div className={"border-b p-4 flex justify-between items-center space-x-2"}>
        <div className={"flex-1"}>
            <div className={"flex space-x-4 items-center pb-2"}>
                {feed.type == "custom" && feed.feed.avatar && <div className={""}>
                    <Image
                        src={feed.feed.avatar}
                        alt={"Avatar de " + feed.feed.displayName}
                        className={"h-12 w-12 rounded-[8px]"}
                        width={400}
                        height={400}
                    />
                </div>}
                <div>
                    <h2 className={"text-base font-semibold"}>
                        {name}
                    </h2>
                    {feed.type == "custom" && <div className={"text-[var(--text-light)] font-light text-sm"}>
                <span>
                    Creado por
                </span> <Link className={"hover:underline"} href={profileUrl(feed.feed.creator.handle)}>
                        {feed.feed.creator.displayName}
                    </Link> {!feed.feed.creator.displayName.startsWith("@") &&
                        <Link className={""} href={profileUrl(feed.feed.creator.handle)}>
                            @{feed.feed.creator.handle}
                        </Link>}
                    </div>}
                </div>
            </div>
            {description && <BskyRichTextContent
                className={"text-[15px]"}
                post={{text: description, facets: descriptionFacets}}
            />}
        </div>
        <div className={"flex items-center space-x-2"}>
            <BaseIconButton
                variant={"outlined"}
                size={"small"}
                onClick={() => {
                    addFeed(feedViewToConfig(feed))
                }}
            >
                <PlusIcon/>
            </BaseIconButton>
        </div>
    </div>
}


async function searchCustomFeeds(query: string) {
    const res = await get<FeedView[]>(
        `/custom-feeds?q=${encodeURIComponent(query)}`
    )

    return res.data
}


async function searchTopicFeeds(query: string) {
    const res = await get<FeedView[]>(
        `/topic-feeds?q=${encodeURIComponent(query)}`
    )

    if(res.data == null) {
        throw Error("Error al obtener los muros de temas.")
    }

    return res.data
}


const CustomFeedSearch = () => {
    const [searchQuery, setSearchQuery] = useState("")
    const [debouncedQuery] = useDebounceValue(searchQuery, 300)
    const {
        data: searchResults,
        isLoading,
        isFetching,
        isError
    } = useQuery({
        queryKey: ["custom-feeds", "search", debouncedQuery],
        queryFn: () => searchCustomFeeds(debouncedQuery),
        staleTime: 1000 * 60 * 5
    })

    return <div className={"space-y-2 pt-2 px-2"}>
        <BaseTextField
            value={searchQuery}
            onChange={(e) => {
                setSearchQuery(e.target.value)
            }}
            placeholder={"Buscar..."}
        />
        {isLoading || isFetching && <LoadingSpinner className={"py-16"}/>}
        {searchResults != null && !isFetching && !isLoading && searchResults.map((f, i) => {
            return <FeedPreview key={i} feed={f}/>
        })}
        {searchResults != null && !isError && !isFetching && !isLoading && searchResults.length == 0 && <Note>
            No se encontraron resultados.
        </Note>}
        {isError && <Note>
            Ocurrió un error al buscar.
        </Note>}
    </div>
}


const basicFeeds: FeedView[] = [
    {
        type: "main",
        subtype: "siguiendo"
    },
    {
        type: "main",
        subtype: "discusion"
    },
    {
        type: "main",
        subtype: "descubrir",
    }
]


const BasicFeeds = () => {

    return <div>
        {basicFeeds.map((f, i) => {
            return <FeedPreview feed={f} key={i}/>
        })}
    </div>
}


const TopicFeeds = () => {
    const [searchQuery, setSearchQuery] = useState("")
    const [debouncedQuery] = useDebounceValue(searchQuery, 300)
    const {
        data: searchResults,
        isLoading,
        isFetching,
    } = useQuery({
        queryKey: ["topic-feeds", "search", debouncedQuery],
        queryFn: () => searchTopicFeeds(debouncedQuery),
        staleTime: 1000 * 60 * 5
    })

    return <div className={"space-y-2 pt-2 px-2"}>
        <BaseTextField
            value={searchQuery}
            onChange={(e) => {
                setSearchQuery(e.target.value)
            }}
            placeholder={"Buscar..."}
        />
        {isLoading || isFetching && <LoadingSpinner className={"py-16"}/>}
        {searchResults != null && !isFetching && !isLoading && searchResults.map((f, i) => {
            return <FeedPreview key={i} feed={f}/>
        })}
        {searchResults != null && !isFetching && !isLoading && searchResults.length == 0 && <Note>
            No se encontraron resultados.
        </Note>}
    </div>
}


export default function Page() {
    const [selected, setSelected] = useState("Básicos")

    return <div className={"pb-16"}>
        <div>
            <SelectionComponent
                onSelection={setSelected}
                selected={selected}
                options={["Básicos", "Temas", "Creados por la comunidad", "Perfiles"]}
                optionsNodes={feedOptionNodes(40)}
                className={"flex border-b border-[var(--accent-dark)]"}
                optionContainerClassName={"flex"}
            />
        </div>
        {selected == "Creados por la comunidad" && <CustomFeedSearch/>}
        {selected == "Básicos" && <BasicFeeds/>}
        {selected == "Temas" && <TopicFeeds/>}
    </div>
}