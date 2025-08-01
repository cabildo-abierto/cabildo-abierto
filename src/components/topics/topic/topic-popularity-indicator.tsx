import DescriptionOnHover from "../../../../modules/ui-utils/src/description-on-hover";
import {topicUrl} from "@/utils/uri";
import ValidationIcon from "@/components/profile/validation-icon";
import {TopicPopularity} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";
import {TimePeriod} from "@/queries/useTrendingTopics";


export default function TopicPopularityIndicator({counts, selected}: {
    counts: TopicPopularity, selected: TimePeriod
}) {

    let count: number | undefined
    let periodText: string | undefined
    if(selected == "week"){
        count = counts.lastWeek[0]
        periodText = "la última semana"
    } else if(selected == "day"){
        count = counts.lastDay[0]
        periodText = "el último día"
    } else if(selected == "month" || selected == "all"){
        count = counts.lastMonth[0]
        periodText = "el último mes"
    } else {
        return null
    }

    return <DescriptionOnHover
        description={`${count} persona${count == 1 ? " participó" : "s participaron"} en la discusión sobre el tema en ${periodText}.`}
        moreInfoHref={topicUrl("Cabildo Abierto: Popularidad de temas")}
    >
        <div className={"text-[var(--text-light)] text-xs flex items-center"} id={"topic-popularity"}>
            <div>{count}</div>
            <div>
                <ValidationIcon
                    fontSize={10}
                    validation={"person"}
                    handle={null}
                    iconColor={"text"}
                    color={"background-dark"}
                />
            </div>
        </div>
    </DescriptionOnHover>
}