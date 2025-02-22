import {SmallTopicProps} from "../../app/lib/definitions";
import {useState} from "react";
import {getTopicTitle} from "../topic/utils";
import {CustomLink as Link} from "../custom-link";
import {articleUrl} from "../utils";
import Button from "@mui/material/Button";
import PersonIcon from "@mui/icons-material/Person";
import {TopicCategories} from "../entity-categories-small";

export const TrendingArticlesSlider = ({trendingArticles}: {
    trendingArticles: SmallTopicProps[]}) => {
    const [hovering, setHovering] = useState<number>(undefined)

    return (
        <div
            className="flex flex-col overflow-y-scroll max-h-[280px] no-scrollbar"
        >
            {trendingArticles.map((topic, index) => {

                const title = getTopicTitle(topic)
                return <Link href={articleUrl(topic.id)} draggable={false}
                     className="flex flex-col py-4 w-full px-3 sm:text-sm text-xs text-[0.72rem] hover:bg-[var(--background-dark)]"
                     key={topic.id}
                     onMouseLeave={() => {
                         setHovering(undefined)
                     }}
                     onMouseEnter={() => {/*preload("/api/entity/"+entity.id, fetcher);*/
                         setHovering(index)
                     }}
                >
                    <TopicCategories topic={topic} className={"text-xs text-[var(--text-light)]"} maxCount={1}/>
                    <div className={"font-semibold w-full " + (hovering == index ? "" : "truncate")}>
                        {title}
                    </div>

                    <div
                        className="text-[var(--text-light)] text-xs sm:text-sm"
                    >
                        <div title="La cantidad de usuarios que participaron en la discusión.">
                            {topic.score[0]} {topic.score[0] == 1 ? "persona" : "personas."}
                        </div>
                    </div>
                </Link>
            })}
        </div>
    );
}