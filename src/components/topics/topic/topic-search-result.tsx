"use client"
import {getTopicCategories, getTopicTitle} from "./utils";
import TopicCategories from "./topic-categories";
import {topicUrl} from "@/utils/uri";
import {TopicViewBasic} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";
import TopicPopularityIndicator from "@/components/topics/topic/topic-popularity-indicator";
import {TimePeriod} from "@/queries/useTrendingTopics";
import {rounder} from "@/utils/strings";
import DescriptionOnHover from "../../../../modules/ui-utils/src/description-on-hover";
import {DateSince} from "../../../../modules/ui-utils/src/date";
import {formatIsoDate} from "@/utils/dates";
import {useLayoutConfig} from "@/components/layout/layout-config-context";
import {CustomLink} from "../../../../modules/ui-utils/src/custom-link";


const TopicNumWords = ({numWords}: {numWords: number}) => {
    return <div className={"min-w-[90px] justify-end flex space-x-2 items-center text-xs mt-1 text-[var(--text-light)]"}>
        {numWords <= 1 ? "Sin contenido."  : rounder(numWords) + " palabras."}
    </div>
}


export function hasUnseenUpdate(topic: TopicViewBasic){
    return topic.currentVersionCreatedAt && (
        !topic.lastSeen || new Date(topic.lastSeen) < new Date(topic.currentVersionCreatedAt)
    )
}


const TopicSearchResult = ({topic, index, time}: {
    topic: TopicViewBasic
    index?: number
    time?: TimePeriod
}) => {
    const {isMobile} = useLayoutConfig()

    const categories = getTopicCategories(topic.props)

    const unseenUpdate = hasUnseenUpdate(topic)

    return (
        <CustomLink
            tag={"div"}
            href={topicUrl(topic.id)}
            className={"px-3 py-4 w-full flex justify-between hover:bg-[var(--background-dark)] bg-[var(--background)] cursor-pointer"}
            id={"topic-search-result"}
        >
            <div className={"sm:max-w-[70%] w-full flex items-start flex-col sm:space-y-2"}>
                <div className={"flex space-x-1 items-center text-xs text-[var(--text-light)]"}>
                    {index != undefined ? <div>
                        {index + 1}
                    </div> : null}
                    {categories && categories.length > 0 && index != undefined && <div>
                        -
                    </div>}
                    <TopicCategories
                        className={"text-[var(--text-light)] hover:text-[var(--text)]"}
                        containerClassName={"text-xs"}
                        maxCount={isMobile ? 2 : undefined}
                        categories={categories}
                    />
                </div>

                <div className="font-semibold mb-1 flex space-x-1">
                    {getTopicTitle(topic)}
                </div>

                {topic.popularity != null && <TopicPopularityIndicator
                    selected={time}
                    counts={topic.popularity}
                />}
            </div>

            <div className={"flex flex-col justify-between items-end space-y-2 sm:min-w-[30%]"}>
                {topic.currentVersionCreatedAt != null && <DescriptionOnHover
                    description={topic.currentVersionCreatedAt ? `La versión oficial del tema cambió desde la última vez que entraste. La versión actual es del ${formatIsoDate(new Date(topic.currentVersionCreatedAt), true)}.` : undefined}
                >
                    <div className={"flex space-x-1"}>
                        <div className={"text-xs text-[var(--text-light)] truncate"}>
                            <DateSince date={topic.currentVersionCreatedAt} title={false}/>
                        </div>
                        {unseenUpdate && <div className={"rounded-full bg-red-600 w-[4px] h-[4px] mt-1"}/>}
                    </div>
                </DescriptionOnHover>}
                {topic.numWords != null && <TopicNumWords numWords={topic.numWords}/>}
            </div>
        </CustomLink>
    );
}


export default TopicSearchResult;