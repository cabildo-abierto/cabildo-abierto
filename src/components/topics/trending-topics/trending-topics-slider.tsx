import {useState} from "react";
import {getTopicCategories, getTopicTitle} from "@/components/topics/topic/utils";
import {CustomLink as Link} from "../../../../modules/ui-utils/src/custom-link";
import {useRouter} from "next/navigation";
import TopicCategories from "@/components/topics/topic/topic-categories";
import {topicUrl} from "@/utils/uri";
import {TopicViewBasic} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";
import TopicPopularityIndicator from "@/components/topics/topic/topic-popularity-indicator";
import {TimePeriod} from "@/queries/api";


const TrendingTopicsSlider = ({selected, trendingArticles}: {
    trendingArticles: TopicViewBasic[]
    selected: TimePeriod
}) => {
    const [hovering, setHovering] = useState<number>(undefined)
    const router = useRouter()

    return (
        <div
            className="flex flex-col overflow-y-scroll max-h-[300px] no-scrollbar"
        >
            {trendingArticles.map((topic, index) => {
                const title = getTopicTitle(topic)
                return <div
                    onClick={() => {router.push(topicUrl(topic.id))}} draggable={false}
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
                    <TopicCategories
                        categories={getTopicCategories(topic.props)}
                        className={"text-xs text-[var(--text-light)]"}
                        maxCount={1}
                    />

                    <div className={"font-semibold w-full max-w-[225px] text-[15px] " + (hovering == index ? "" : "truncate")}>
                        {title}
                    </div>

                    {topic.popularity && <TopicPopularityIndicator
                        selected={selected}
                        counts={topic.popularity}
                    />}
                </div>
            })}
            <Link href={"/temas"} className={"hover:bg-[var(--background-dark2)] rounded-b-lg text-sm text-[var(--text-light)] px-5 py-1"}>
                Ver más
            </Link>
        </div>
    );
}

export default TrendingTopicsSlider;