import {useState} from "react";
import {getTopicCategories, getTopicTitle} from "../../../../tema/utils";
import {CustomLink, CustomLink as Link} from "@/components/utils/base/custom-link";
import TopicCategories from "../../../../tema/view/topic-categories";
import {topicUrl} from "@/components/utils/react/url";
import TopicPopularityIndicator from "../../../../tema/topic-popularity-indicator";
import {TimePeriod} from "@/queries/getters/useTrendingTopics";
import {hasUnseenUpdate} from "../../../../buscar/topic-search-result";
import {DescriptionOnHover} from "@/components/utils/base/description-on-hover";
import {formatIsoDate} from "@cabildo-abierto/utils/dist/dates";
import {ArCabildoabiertoWikiTopicVersion} from "@cabildo-abierto/api"
import {useSession} from "@/components/auth/use-session";
import {cn} from "@/lib/utils";


export const TrendingTopicInSlider = ({
    topic,
    selected
                                      }: {
    selected: TimePeriod
    topic: ArCabildoabiertoWikiTopicVersion.TopicViewBasic
}) => {
    const {user} = useSession()
    const title = getTopicTitle(topic)
    const unseenUpdate = hasUnseenUpdate(user, topic)
    const [hovering, setHovering] = useState<boolean>(false)

    return <CustomLink
        tag={"div"}
        href={topicUrl(topic.id)}
        draggable={false}
        className="cursor-pointer flex flex-col items-start py-4 w-full px-5 sm:text-sm text-xs hover:bg-[var(--background-dark)]"
        key={topic.id}
        onMouseLeave={() => {
            setHovering(false)
        }}
        onMouseEnter={() => {
            setHovering(true)
        }}
    >
        <div className={"flex justify-between w-full"}>
            <TopicCategories
                categories={getTopicCategories(topic.props)}
                className={"text-xs font-light text-[var(--text-light)]"}
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
                className={cn("font-medium w-full max-w-[225px] text-[15px]", hovering && "truncate")}
            >
                {title}
            </div>
        </div>

        {topic.popularity && <TopicPopularityIndicator
            selected={selected}
            counts={topic.popularity}
        />}
    </CustomLink>
}


const TrendingTopicsSlider = ({selected, trendingArticles}: {
    trendingArticles: ArCabildoabiertoWikiTopicVersion.TopicViewBasic[]
    selected: TimePeriod
}) => {

    return (
        <div className={"flex flex-col"}>
            <div
                onWheel={e => {e.stopPropagation()}}
                className="flex flex-col overflow-y-scroll max-h-[260px] no-scrollbar"
            >
                {trendingArticles.map((topic, index) => {
                    return <TrendingTopicInSlider
                        key={index}
                        topic={topic}
                        selected={selected}
                    />
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