import {useTopicFeed} from "@/hooks/api";
import SelectionComponent from "@/components/buscar/search-selection-component";
import {useState} from "react";
import {CustomLink} from "../../../../modules/ui-utils/src/custom-link";
import {useSearchParams} from "next/navigation";
import {topicUrl} from "@/utils/uri";
import LoadingSpinner from "../../../../modules/ui-utils/src/loading-spinner";
import {FeedViewContentFeed} from "@/components/feed/feed/feed-view-content-feed";
import { Button } from "../../../../modules/ui-utils/src/button";


export const TopicFeed = ({topicId, onClickQuote}: {topicId: string, onClickQuote: (cid: string) => void}) => {
    let feed = useTopicFeed(topicId)
    const params = useSearchParams()
    const s = params.get("s")
    const minimized = !s || s == "minimized"
    const [selected, setSelected] = useState<string>(minimized ? "Menciones" : "Respuestas al contenido")
    const [mentionsSelected, setMentionsSelected] = useState<string>("Publicaciones")

    function optionsNodes(o: string, isSelected: boolean){
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
                <div className={"whitespace-nowrap font-semibold pb-1 pt-2 border-b-[4px] " + (isSelected ? "border-[var(--primary)] border-b-[4px] text-[var(--text)]" : "text-[var(--text-light)] border-transparent")}>
                    {o}
                </div>
            </Button>
        </div>
    }

    async function onDeleteFeedElem() {
        // mutate("/api/topic-feed/"+encodeURIComponent(topicId))
    }

    function optionsNodesMentions(o: string, isSelected: boolean){
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



    return <div className={"mb-96"}>
        <div className={"flex border-b w-full max-w-screen overflow-scroll no-scrollbar " + (minimized ? "" : "justify-center")}>
            <SelectionComponent
                onSelection={setSelected}
                selected={selected}
                optionsNodes={optionsNodes}
                options={["Menciones", "Respuestas al contenido"]}
                className={"flex w-full"}
            />
        </div>
        {/*BUG: Cuando una respuesta es una mención no debería aparecer línea vertical arriba de la foto de perfil*/}
        {selected == "Menciones" && <div className={"flex py-2 px-2 justify-center"}>
            <SelectionComponent
                onSelection={setMentionsSelected}
                selected={mentionsSelected}
                optionsNodes={optionsNodesMentions}
                options={["Publicaciones", "Temas"]}
                className={"flex space-x-2"}
            />
        </div>}
        <div className={"flex justify-center"}>
            <div className={"max-w-[600px]"}>
                {selected == "Menciones" && mentionsSelected == "Publicaciones" &&
                    <FeedViewContentFeed
                        initialContents={feed.data ? feed.data.mentions : undefined}
                        onClickQuote={onClickQuote}
                        noResultsText={"El tema todavía no fue mencionado."}
                        onDeleteFeedElem={onDeleteFeedElem}
                        isThreadFeed={true}
                    />
                }

                {selected == "Respuestas al contenido" &&
                    <div className={"pt-10"}>
                        <FeedViewContentFeed
                            initialContents={feed.data ? feed.data.replies : undefined}
                            onClickQuote={onClickQuote}
                            noResultsText={"Este tema todavía no recibió respuestas."}
                            onDeleteFeedElem={onDeleteFeedElem}
                            isThreadFeed={true}
                        />
                    </div>
                }

                {selected == "Menciones" && mentionsSelected == "Temas" && feed.data &&
                    <div className={"flex flex-col"}>
                        {
                            feed.data.topics.map((t, index) => {
                                return <CustomLink
                                    href={topicUrl(t)}
                                    key={index}
                                    className={"border-b p-4 font-medium hover:bg-[var(--background-dark)]"}
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