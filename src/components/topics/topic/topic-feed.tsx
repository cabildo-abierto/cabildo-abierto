import SelectionComponent from "@/components/buscar/search-selection-component";
import {CustomLink} from "../../../../modules/ui-utils/src/custom-link";
import {useSearchParams} from "next/navigation";
import {topicUrl} from "@/utils/uri";
import FeedViewContentFeed from "@/components/feed/feed/feed-view-content-feed";
import InfoPanel from "../../../../modules/ui-utils/src/info-panel";
import Link from "next/link"
import {get, updateSearchParam} from "@/utils/fetch";
import Feed from "@/components/feed/feed/feed";
import {EnDiscusionMetric, EnDiscusionTime, GetFeedOutput, Session, WikiEditorState} from "@/lib/types";
import {ArCabildoabiertoFeedDefs, ArCabildoabiertoWikiTopicVersion} from "@/lex-api/index"
import {useMemo, useRef} from "react";
import {ClickableModalOnClick} from "../../../../modules/ui-utils/src/popover";
import {SlidersHorizontalIcon} from "@phosphor-icons/react";
import {useSession} from "@/queries/useSession";
import {stringToEnum} from "@/utils/strings";
import {
    defaultTopicMentionsFormat,
    defaultTopicMentionsMetric,
    defaultTopicMentionsTime
} from "@/components/config/defaults";
import {feedOptionNodes} from "@/components/config/feed-option-nodes";
import {ReplyButton} from "@/components/thread/reply-button";
import {ReplyToContent} from "@/components/writing/write-panel/write-panel";

type TopicFeedOption = "Menciones" | "Respuestas" | "Otros temas"

function topicFeedParamToTopicFeedOption(v: string | undefined, minimized: boolean): TopicFeedOption {
    if (v) {
        return v == "discusion" ? "Respuestas" : v == "menciones" ? "Menciones" : "Otros temas"
    } else {
        return "Menciones"
    }
}

const enDiscusionMetricOptions: EnDiscusionMetric[] = ["Me gustas", "Interacciones", "Popularidad relativa", "Recientes"]
const enDiscusionTimeOptions: EnDiscusionTime[] = ["Último día", "Último mes", "Última semana"]


export const useTopicFeedParams = (user: Session) => {
    const params = useSearchParams()
    const s = params.get("s")
    const minimized = !s || s == "minimized"

    const defaultMetric = user?.algorithmConfig.topicMentions?.metric ?? defaultTopicMentionsMetric
    const defaultTime = user?.algorithmConfig.topicMentions?.time ?? defaultTopicMentionsTime
    const defaultFormat = user?.algorithmConfig.topicMentions?.format ?? defaultTopicMentionsFormat
    const metric = stringToEnum(params.get("m"), enDiscusionMetricOptions, defaultMetric)
    const time = stringToEnum(params.get("p"), enDiscusionTimeOptions, defaultTime)
    const format = stringToEnum(params.get("formato"), ["Todos", "Artículos"], defaultFormat)

    return {
        metric,
        time,
        format,
        selected: topicFeedParamToTopicFeedOption(params.get("f"), minimized)
    }
}


const TopicMentionsFeedConfig = () => {
    const {user} = useSession()
    const {metric, time, format} = useTopicFeedParams(user)

    function setMetric(v: string) {
        updateSearchParam("m", v)
    }

    function setTime(v: string) {
        updateSearchParam("p", v)
    }

    function setFormat(v: string) {
        updateSearchParam("formato", v)
    }

    function optionsNodes(o: string, selected: boolean) {
        return <button
            className={"text-sm rounded-lg px-2 cursor-pointer " + (selected ? "bg-[var(--primary)] text-[var(--button-text)]" : "bg-[var(--background-dark2)] text-[var(--text)]")}
        >
            {o}
        </button>
    }

    return <div className={"space-y-4 pt-2"}>
        <div>
            <div className={"text-xs text-[var(--text-light)]"}>
                Métrica
            </div>
            <SelectionComponent
                onSelection={setMetric}
                options={["Interacciones", "Recientes", "Me gustas", "Popularidad relativa"]}
                optionsNodes={optionsNodes}
                selected={metric}
                className={"flex gap-x-2 gap-y-1 flex-wrap"}
                optionContainerClassName={""}
            />
        </div>
        {metric != "Recientes" && <div>
            <div className={"text-xs text-[var(--text-light)]"}>
                Período
            </div>
            <SelectionComponent
                onSelection={setTime}
                options={["Último día", "Última semana", "Último mes"]}
                optionsNodes={optionsNodes}
                selected={time}
                className={"flex gap-x-2 gap-y-1 flex-wrap"}
                optionContainerClassName={""}
            />
        </div>}
        <div>
            <div className={"text-xs text-[var(--text-light)]"}>
                Formato
            </div>
            <SelectionComponent
                onSelection={setFormat}
                options={["Todos", "Artículos"]}
                optionsNodes={optionsNodes}
                selected={format}
                className={"flex gap-x-2 gap-y-1 flex-wrap"}
                optionContainerClassName={""}
            />
        </div>
    </div>
}


const TopicFeedConfig = ({selected}: { selected: TopicFeedOption }) => {
    const buttonRef = useRef<HTMLButtonElement>(null)

    const modal = (close: () => void) => (
        <div className={"p-3 space-y-2 bg-[var(--background)] w-56"}>
            <div className={"w-full flex justify-between items-end"}>
                <div className={"text-sm text-[var(--text)]"}>
                    Configurar <span className={"font-semibold text-[var(--text-light)]"}
                >
                    {selected}
                </span>
                </div>
                <InfoPanel onClick={() => {
                    window.open(topicUrl("Cabildo Abierto: Muros"), "_blank")
                }}/>
            </div>
            <div>
                <TopicMentionsFeedConfig/>
            </div>
        </div>
    )

    return <ClickableModalOnClick
        modal={modal}
        id={"feed-config"}
    >
        <button id="feed-config-button" ref={buttonRef} className={"hover:bg-[var(--background-dark)] rounded p-1"}>
            <SlidersHorizontalIcon size={22} weight={"light"}/>
        </button>
    </ClickableModalOnClick>
}


export const TopicFeed = ({
                              topic,
                              topicVersionUri,
                              onClickQuote,
    replyToContent,
    setWritingReply,
                          wikiEditorState}: {
    topicVersionUri: string,
    topic: ArCabildoabiertoWikiTopicVersion.TopicView,
    onClickQuote: (cid: string) => void
    wikiEditorState: WikiEditorState
    replyToContent?: ReplyToContent
    setWritingReply: (v: boolean) => void
}) => {
    const {user} = useSession()
    const {selected, metric, time, format} = useTopicFeedParams(user)

    const topicId = topic.id

    async function getMentionsFeed(cursor: string) {
        return await get<GetFeedOutput<ArCabildoabiertoFeedDefs.FeedViewContent>>(
            `/topic-feed/mentions?i=${topicId}&metric=${metric}&time=${time}&format=${format}${cursor ? `&cursor=${cursor}` : ""}`
        )
    }

    async function getDiscussionFeed(cursor: string) {
        return await get<GetFeedOutput<ArCabildoabiertoFeedDefs.FeedViewContent>>(`/topic-feed/discussion?i=${topicId}${cursor ? `&cursor=${cursor}` : ""}`)
    }

    async function getMentionsInTopicsFeed(cursor: string) {
        return await get<GetFeedOutput<{
            id: string,
            title: string
        }>>(`/topic-mentions-in-topics-feed?i=${topicId}${cursor ? `&cursor=${cursor}` : ""}`)
    }

    function setSelected(v: TopicFeedOption) {
        updateSearchParam("f", v == "Respuestas" ? "discusion" : v == "Menciones" ? "menciones" : "temas")
    }

    const info = <div>
        <div>
            <b>Menciones.</b> Las publicaciones, respuestas, artículos y otros temas que hablaron del tema. <Link
            target="_blank"
            className="text-[var(--text-light)] hover:underline"
            href={topicUrl("Cabildo Abierto: Menciones a temas")}
        >
            ¿Cómo detectamos las menciones?
        </Link>
        </div>
        <div>
            <b>Discusión.</b> Una sección de comentarios hechos directamente sobre el tema. Se puede usar para agregar
            opiniones.
        </div>
        <div>
            <b>Otros temas.</b> Temas cuyo contenido menciona a este tema.
        </div>
    </div>

    const mentionsFeed = useMemo(() => {
        return <FeedViewContentFeed
            queryKey={["topic-feed", topicId, "mentions", metric, time, format]}
            getFeed={getMentionsFeed}
            onClickQuote={onClickQuote}
            noResultsText={"Todavía no fue mencionado."}
            endText={"Fin del feed."}
        />
    }, [metric, time, format, topicId])

    const repliesFeed = useMemo(() => {
        return <FeedViewContentFeed
            queryKey={["topic-feed", topicId, "replies"]}
            getFeed={getDiscussionFeed}
            onClickQuote={onClickQuote}
            noResultsText={"Todavía no hay respuestas."}
            endText={""}
            pageRootUri={topicVersionUri}
        />
    }, [metric, time, format, topicVersionUri])

    const topicsFeed = useMemo(() => {
        return <Feed<{ id: string, title: string }>
            queryKey={["topic-feed", topicId, "mentions-in-topics"]}
            getFeed={getMentionsInTopicsFeed}
            noResultsText={"Este tema no recibió menciones en otros temas."}
            FeedElement={(({content, index}) => {
                return <CustomLink
                    tag={"div"}
                    href={topicUrl(content.id)}
                    key={index}
                    className={"w-full border-b p-4 font-medium hover:bg-[var(--background-dark)]"}
                >
                    {content.title}
                </CustomLink>
            })}
            endText={""}
            getFeedElementKey={e => e.id}
        />
    }, [metric, time, format, topicId])

    return <div className={"mb-96 flex flex-col items-center"}>
        <div className={"border-b border-[var(--text-lighter)] flex justify-center w-full " + (wikiEditorState == "minimized" ? "" : "")}>
        <div
            className={"max-w-[600px] flex justify-between items-center pr-2 w-full max-w-screen overflow-scroll no-scrollbar"}
        >
            <SelectionComponent<TopicFeedOption>
                onSelection={setSelected}
                selected={selected}
                optionsNodes={feedOptionNodes(40, undefined, "sm:text-[12px] text-[13px]")}
                options={["Menciones", "Respuestas", "Otros temas"]}
                className={"flex"}
            />

            <div className={"flex space-x-2 items-center"}>
                <div className={"pb-1"}>
                    <InfoPanel
                    text={info}
                />
                </div>
                <TopicFeedConfig selected={"Menciones"}/>
            </div>
        </div>
        </div>
        {/*TO DO: Cuando una respuesta es una mención no debería aparecer línea vertical arriba de la foto de perfil*/}
        <div className={"flex justify-center w-full"}>
            <div className={"max-w-[600px] w-full"}>
                {selected == "Menciones" && mentionsFeed}

                {selected == "Respuestas" &&
                    <div className={""}>
                        {replyToContent != null && <div className={"w-full"}>
                            <ReplyButton
                                text={"Responder"}
                                onClick={() => {setWritingReply(true)}}
                            />
                        </div>}
                        {repliesFeed}
                    </div>
                }

                {selected == "Otros temas" && topicsFeed}
            </div>
        </div>
    </div>
}