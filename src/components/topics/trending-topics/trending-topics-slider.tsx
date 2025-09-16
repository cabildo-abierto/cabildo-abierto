import {useState} from "react";
import {getTopicCategories, getTopicTitle} from "@/components/topics/topic/utils";
import {CustomLink as Link} from "../../../../modules/ui-utils/src/custom-link";
import {useRouter} from "next/navigation";
import TopicCategories from "@/components/topics/topic/topic-categories";
import {topicUrl} from "@/utils/uri";
import TopicPopularityIndicator from "@/components/topics/topic/topic-popularity-indicator";
import {TimePeriod} from "@/queries/useTrendingTopics";
import {hasUnseenUpdate} from "@/components/topics/topic/topic-search-result";
import DescriptionOnHover from "../../../../modules/ui-utils/src/description-on-hover";
import {formatIsoDate} from "@/utils/dates";
import {ArCabildoabiertoWikiTopicVersion} from "@/lex-api/index"


const TrendingTopicsSlider = ({selected, trendingArticles}: {
    trendingArticles: ArCabildoabiertoWikiTopicVersion.TopicViewBasic[]
    selected: TimePeriod
}) => {
    const [hovering, setHovering] = useState<number>(undefined)
    const router = useRouter()

    return (
        <div className={"flex flex-col rounded-lg"}>
            <div
                className="flex flex-col overflow-y-scroll max-h-[260px] no-scrollbar"
            >
                {trendingArticles.map((topic, index) => {
                    const title = getTopicTitle(topic)
                    const unseenUpdate = hasUnseenUpdate(topic)
                    return <div
                        onClick={() => {
                            router.push(topicUrl(topic.id))
                        }} draggable={false}
                        className="cursor-pointer flex flex-col items-start py-4 w-full px-5 sm:text-sm text-xs hover:bg-[var(--background-dark2)]"
                        key={topic.id}
                        onMouseLeave={() => {
                            setHovering(undefined)
                        }}
                        onMouseEnter={() => {
                            /*preload("/api/entity/"+entity.id, fetcher);*/ // TO DO
                            setHovering(index)
                        }}
                    >
                        <div className={"flex justify-between w-full"}>
                            <TopicCategories
                                categories={getTopicCategories(topic.props)}
                                className={"text-xs text-[var(--text-light)]"}
                                maxCount={1}
                            />
                            <DescriptionOnHover
                                description={topic.currentVersionCreatedAt ? `La versión oficial del tema cambió desde la última vez que entraste. La versión actual es del ${formatIsoDate(new Date(topic.currentVersionCreatedAt), true)}.` : undefined}
                            >
                                {unseenUpdate && <div className={"rounded-full bg-red-600 w-[4px] h-[4px] mt-1"}/>}
                            </DescriptionOnHover>
                        </div>

                        <div className={"flex space-x-1"}>
                            <div
                                className={"font-semibold w-full max-w-[225px] text-[15px] " + (hovering == index ? "" : "truncate")}>
                                {title}
                            </div>
                        </div>

                        {topic.popularity && <TopicPopularityIndicator
                            selected={selected}
                            counts={topic.popularity}
                        />}
                    </div>
                })}
            </div>
            <Link
                href={"/temas"}
                className={"uppercase flex hover:bg-[var(--background-dark)] w-full p-3 font-semibold text-xs"}
            >
                Ver más
            </Link>
        </div>

    );
}

export default TrendingTopicsSlider;