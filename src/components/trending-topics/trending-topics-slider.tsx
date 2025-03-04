import {SmallTopicProps} from "../../app/lib/definitions";
import {useState} from "react";
import {getTopicCategories, getTopicTitle} from "../topic/utils";
import {CustomLink as Link} from "../ui-utils/custom-link";
import {topicUrl} from "../utils/utils"
import {useRouter} from "next/navigation";
import {TopicCategories} from "../topic/topic-categories";


export const TrendingArticlesSlider = ({trendingArticles}: {
    trendingArticles: SmallTopicProps[]}) => {
    const [hovering, setHovering] = useState<number>(undefined)
    const router = useRouter()

    return (
        <div
            className="flex flex-col overflow-y-scroll max-h-[280px] no-scrollbar"
        >
            {trendingArticles.map((topic, index) => {

                const title = getTopicTitle(topic)
                return <div
                    onClick={() => {router.push(topicUrl(topic.id))}} draggable={false}
                    className="cursor-pointer flex flex-col py-4 w-full px-3 sm:text-sm text-xs text-[0.72rem] hover:bg-[var(--background-dark)]"
                    key={topic.id}
                    onMouseLeave={() => {
                        setHovering(undefined)
                    }}
                    onMouseEnter={() => {
                        /*preload("/api/entity/"+entity.id, fetcher);*/
                        setHovering(index)
                    }}
                >
                    <TopicCategories
                        categories={getTopicCategories(topic)}
                        className={"text-xs text-[var(--text-light)]"}
                        maxCount={1}
                    />

                    <div className={"font-semibold w-full text-[15px] " + (hovering == index ? "" : "truncate")}>
                        {title}
                    </div>

                    <div
                        className="text-[var(--text-light)] text-xs sm:text-sm"
                    >
                        <div title="La cantidad de usuarios que participaron en la discusión.">
                            {topic.score[0]} {topic.score[0] == 1 ? "persona" : "personas."}
                        </div>
                    </div>
                </div>
            })}
            <Link href={"/temas"} className={"hover:bg-[var(--background-dark)] text-sm text-[var(--text-light)] px-3 py-1"}>
                Ver más
            </Link>
        </div>
    );
}