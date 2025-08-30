import {useTopicFeed} from "@/queries/useTopic";
import SelectionComponent from "@/components/buscar/search-selection-component";
import {useState} from "react";
import {CustomLink} from "../../../../modules/ui-utils/src/custom-link";
import {useSearchParams} from "next/navigation";
import {topicUrl} from "@/utils/uri";
import LoadingSpinner from "../../../../modules/ui-utils/src/loading-spinner";
import { Button } from "../../../../modules/ui-utils/src/button";
import FeedViewContentFeed from "@/components/feed/feed/feed-view-content-feed";
import InfoPanel from "../../../../modules/ui-utils/src/info-panel";
import Link from "next/link"
import {updateSearchParam} from "@/utils/fetch";

type TopicFeedOption = "Menciones" | "Discusión"
type MentionFeedOption = "Publicaciones" | "Temas"

function topicFeedParamToTopicFeedOption(v: string | undefined, minimized: boolean): TopicFeedOption {
    if(v){
        return v == "discusion" ? "Discusión" : "Menciones"
    } else {
        return minimized ? "Menciones" : "Discusión"
    }
}

export const useTopicFeedParams = () => {
    const params = useSearchParams()
    const s = params.get("s")
    const minimized = !s || s == "minimized"

    return topicFeedParamToTopicFeedOption(params.get("f"), minimized)
}

export const TopicFeed = ({topicId, topicVersionUri, onClickQuote}: {topicVersionUri: string, topicId: string, onClickQuote: (cid: string) => void}) => {
    let feed = useTopicFeed(topicId)
    const selected = useTopicFeedParams()

    const [mentionsSelected, setMentionsSelected] = useState<MentionFeedOption>("Publicaciones")

    function setSelected(v: TopicFeedOption) {
        updateSearchParam("f", v == "Discusión" ? "discusion" : "menciones")
    }

    function optionsNodes(o: TopicFeedOption, isSelected: boolean){

        return <div className="text-[var(--text)] h-10 ">
            <Button
                variant="text"
                color="background"
                fullWidth={true}
                disableElevation={true}
                sx={{textTransform: "none",
                    paddingY: 0,
                    borderRadius: 0
                }}
            >
                <div className={"w-24 whitespace-nowrap font-semibold pb-1 pt-2 border-b-[4px] " + (isSelected ? "border-[var(--primary)] border-b-[4px] text-[var(--text)]" : "text-[var(--text-light)] border-transparent")}>
                    {o}
                </div>
            </Button>
        </div>
    }

    function optionsNodesMentions(o: MentionFeedOption, isSelected: boolean){
        return <div className="text-[var(--text)]">
            <Button
                size={"small"}
                sx={{height: "20px"}}
                color={isSelected ? "primary" : "background-dark"}
            >
                {o}
            </Button>
        </div>
    }

    if(!feed.data){
        return <div className={"py-8"}>
            <LoadingSpinner />
        </div>
    }

    const info = <div>
        <b>Menciones.</b> Las publicaciones, respuestas, artículos y otros temas que hablaron del tema. <Link
            target="_blank"
            className="text-[var(--text-light)] hover:underline"
            href={topicUrl("Cabildo Abierto: Menciones a temas")}
        >
        ¿Cómo detectamos las menciones?
        </Link>
        <b>Discusión.</b> Una sección de comentarios hechos directamente sobre el tema. Se puede usar para agregar opiniones.
    </div>

    return <div className={"mb-96"}>
        <div className={"flex justify-between items-center pr-2 border-b w-full max-w-screen overflow-scroll no-scrollbar"}>
            <SelectionComponent
                onSelection={setSelected}
                selected={selected}
                optionsNodes={optionsNodes}
                options={["Menciones", "Discusión"]}
                className={"flex"}
            />
            <InfoPanel
                text={info}
            />
        </div>
        {/*TO DO: BUG: Cuando una respuesta es una mención no debería aparecer línea vertical arriba de la foto de perfil*/}
        {selected == "Menciones" && <div className={"flex py-2 px-2 justify-center"}>
            <SelectionComponent
                onSelection={setMentionsSelected}
                selected={mentionsSelected}
                optionsNodes={optionsNodesMentions}
                options={["Publicaciones", "Temas"]}
                className={"flex space-x-2"}
            />
        </div>}
        <div className={"flex justify-center w-full"}>
            <div className={"max-w-[600px] w-full"}>
                {selected == "Menciones" && mentionsSelected == "Publicaciones" &&
                    <FeedViewContentFeed
                        queryKey={["topic-feed", topicId, "mentions"]}
                        initialContents={feed.data ? feed.data.mentions : undefined}
                        onClickQuote={onClickQuote}
                        noResultsText={"Todavía no fue mencionado."}
                        endText={""}
                    />
                }

                {selected == "Discusión" &&
                    <div className={"pt-10"}>
                        <FeedViewContentFeed
                            queryKey={["topic-feed", topicId, "replies"]}
                            initialContents={feed.data ? feed.data.replies : undefined}
                            onClickQuote={onClickQuote}
                            noResultsText={"Sé la primera persona en agregar un comentario."}
                            endText={""}
                            pageRootUri={topicVersionUri}
                        />
                    </div>
                }

                {selected == "Menciones" && mentionsSelected == "Temas" && feed.data &&
                    <div className={"flex flex-col w-full"}>
                        {
                            feed.data.topics.map((t, index) => {
                                return <CustomLink
                                    href={topicUrl(t)}
                                    key={index}
                                    className={"w-full border-b p-4 font-medium hover:bg-[var(--background-dark)]"}
                                >
                                    {t}
                                </CustomLink>
                            })
                        }
                        {feed.data.topics.length == 0 &&
                            <div className={"text-center text-[var(--text-light)] mt-16"}>
                                Este tema no recibió menciones en otros temas.
                            </div>
                        }
                    </div>
                }
            </div>
        </div>
    </div>
}