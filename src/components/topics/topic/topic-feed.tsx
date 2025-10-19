import SelectionComponent from "@/components/buscar/search-selection-component";
import {CustomLink} from "../../layout/utils/custom-link";
import {useSearchParams} from "next/navigation";
import {getDidFromUri, getRkeyFromUri, topicUrl} from "@/utils/uri";
import FeedViewContentFeed from "@/components/feed/feed/feed-view-content-feed";
import InfoPanel from "../../layout/utils/info-panel";
import Link from "next/link"
import {get} from "@/utils/fetch";
import Feed from "@/components/feed/feed/feed";
import {EnDiscusionMetric, EnDiscusionTime, GetFeedOutput, Session, WikiEditorState} from "@/lib/types";
import {ArCabildoabiertoFeedDefs, ArCabildoabiertoWikiTopicVersion} from "@/lex-api/index"
import {useMemo, useRef} from "react";
import {ClickableModalOnClick} from "../../layout/utils/popover";
import {SlidersHorizontalIcon} from "@phosphor-icons/react";
import {useSession} from "@/queries/getters/useSession";
import {stringToEnum} from "@/utils/strings";
import {
    defaultTopicMentionsFormat,
    defaultTopicMentionsMetric,
    defaultTopicMentionsTime
} from "@/components/config/defaults";
import {feedOptionNodes} from "@/components/config/feed-option-nodes";
import {ReplyToContent} from "@/components/writing/write-panel/write-panel";
import {configOptionNodes} from "@/components/config/config-option-nodes";
import {TopicVotesOnFeed} from "@/components/topics/topic/history/topic-votes-on-feed";
import {useTopicVersion} from "@/queries/getters/useTopic";
import LoadingSpinner from "@/components/layout/utils/loading-spinner";
import {useUpdateSearchParams} from "@/components/layout/utils/update-search-params";

type TopicFeedOption = "Menciones" | "Discusión" | "Otros temas"








export const TopicFeed = ({
                              topic,
                              topicVersionUri,
                              onClickQuote,
                              replyToContent,
                              setWritingReply,
                              wikiEditorState
                          }: {
    topicVersionUri: string,
    topic: ArCabildoabiertoWikiTopicVersion.TopicView,
    onClickQuote: (cid: string) => void
    wikiEditorState: WikiEditorState
    replyToContent?: ReplyToContent
    setWritingReply: (v: boolean) => void
}) => {
    const {user} = useSession()
    const {selected, metric, time, format} = useTopicFeedParams(user)
    const {data: topicVersion, isLoading: topicVersionLoading} = useTopicVersion(getDidFromUri(topicVersionUri), getRkeyFromUri(topicVersionUri))
    const {updateSearchParam} = useUpdateSearchParams()
    const topicId = topic.id

    async function getMentionsFeed(cursor: string) {
        return await get<GetFeedOutput<ArCabildoabiertoFeedDefs.FeedViewContent>>(
            `/topic-feed/mentions?i=${encodeURIComponent(topicId)}&metric=${metric}&time=${time}&format=${format}${cursor ? `&cursor=${cursor}` : ""}`
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
        updateSearchParam("f", v == "Discusión" ? "discusion" : v == "Menciones" ? "menciones" : "temas")
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
            noResultsText={"El tema todavía no fue mencionado."}
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
            endText={"Fin del feed."}
            getFeedElementKey={e => e.id}
            estimateSize={100}
            overscan={10}
        />
    }, [metric, time, format, topicId])

    return <div className={"mb-96 flex flex-col items-center"}>
        <div
            className={"border-b border-[var(--accent-dark)] flex justify-center w-full " + (wikiEditorState == "minimized" ? "" : "")}>
            <div
                className={"max-w-[600px] flex justify-between items-center pr-2 w-full max-w-screen overflow-scroll no-scrollbar"}
            >
                <SelectionComponent<TopicFeedOption>
                    onSelection={setSelected}
                    selected={selected}
                    optionsNodes={feedOptionNodes(40, undefined, "sm:text-[12px] text-[13px]")}
                    options={["Menciones", "Discusión", "Otros temas"]}
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
        <div className={"flex w-full flex-col items-center"}>
            {selected == "Discusión" && topicVersion && repliesFeed && <div
                className={"bg-[var(--background-dark)] w-full flex justify-center mb-2"}
            >
                <TopicVotesOnFeed
                    topic={topicVersion}
                    setWritingReply={setWritingReply}
                />
            </div>}
            <div className={"max-w-[600px] w-full"}>
                {selected == "Menciones" && mentionsFeed}

                {selected == "Discusión" && topicVersion && repliesFeed}

                {selected == "Discusión" && topicVersionLoading && <div className={"py-8"}>
                    <LoadingSpinner/>
                </div>}

                {selected == "Otros temas" && topicsFeed}
            </div>
        </div>
    </div>
}