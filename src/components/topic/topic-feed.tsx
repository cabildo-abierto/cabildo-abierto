"use client"
import {useTopicFeed} from "../../hooks/contents";
import Feed from "../feed/feed";
import SelectionComponent from "../search/search-selection-component";
import {useState} from "react";
import {Button} from "@mui/material";
import {CustomLink} from "../ui-utils/custom-link";
import {useSearchParams} from "next/navigation";
import {topicUrl} from "../utils/uri";


export const TopicFeed = ({topicId, onClickQuote}: {topicId: string, onClickQuote: (cid: string) => void}) => {
    let feed = useTopicFeed(topicId)
    const params = useSearchParams()
    const s = params.get("s")
    const minimized = !s || s == "minimized"
    const [selected, setSelected] = useState<string>(minimized ? "Menciones" : "Respuestas al contenido")
    const [mentionsSelected, setMentionsSelected] = useState<string>("Publicaciones")

    function optionsNodes(o: string, isSelected: boolean){
        return <div className="text-[var(--text)] w-48 h-10">
            <Button
                variant="text"
                color="inherit"
                fullWidth={true}
                disableElevation={true}
                sx={{textTransform: "none",
                    paddingY: 0,
                    borderRadius: 0
                }}
            >
                <div className={"pb-1 pt-2 border-b-[4px] " + (isSelected ? "border-[var(--primary)] font-semibold border-b-[4px]" : "border-transparent")}>
                    {o}
                </div>
            </Button>
        </div>
    }


    function optionsNodesMentions(o: string, isSelected: boolean){
        return <div className="text-[var(--text)]">
            <button
                className={"text-sm px-2 rounded-lg hover:bg-[var(--primary-light)] " + (isSelected ? "bg-[var(--primary)]" : "bg-[var(--background-dark)]")}
            >
                {o}
            </button>
        </div>
    }

    return <div className={"mb-96"}>
        <div className={"flex border-b " + (minimized ? "" : "justify-center")}>
            <SelectionComponent
                onSelection={setSelected}
                selected={selected}
                optionsNodes={optionsNodes}
                options={["Menciones", "Respuestas al contenido"]}
                className={"flex"}
            />
        </div>
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
                    <Feed
                        feed={{feed: feed.feed ? feed.feed.mentions : undefined, isLoading: feed.isLoading, error: feed.error}}
                        onClickQuote={onClickQuote}
                        noResultsText={"El tema todavía no fue mencionado."}
                    />
                }

                {selected == "Respuestas al contenido" &&
                    <Feed
                        feed={{feed: feed.feed ? feed.feed.replies : undefined, isLoading: feed.isLoading, error: feed.error}}
                        onClickQuote={onClickQuote}
                        noResultsText={"Este tema todavía no recibió respuestas."}
                    />
                }

                {selected == "Menciones" && mentionsSelected == "Temas" &&
                    <div className={"flex flex-col"}>
                        {
                            feed.feed.topics.map((t, index) => {
                                return <CustomLink
                                    href={topicUrl(t)}
                                    key={index}
                                    className={"border-b p-4 font-medium hover:bg-[var(--background-dark)]"}
                                >
                                    {t}
                                </CustomLink>
                            })
                        }
                        {feed.feed.topics.length == 0 &&
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