import {DescriptionOnHover} from "@/components/utils/base/description-on-hover";
import {topicUrl} from "@/components/utils/react/url";
import ValidationIcon from "@/components/perfil/validation-icon";
import {TimePeriod} from "@/queries/getters/useTrendingTopics";
import {ArCabildoabiertoWikiTopicVersion} from "@cabildo-abierto/api";


export default function TopicPopularityIndicator({counts, selected}: {
    counts: ArCabildoabiertoWikiTopicVersion.TopicPopularity, selected: TimePeriod
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

    if(count == 0) return null

    return <DescriptionOnHover
        description={`${count} persona${count == 1 ? " participó" : "s participaron"} en la discusión sobre el tema en ${periodText}.`}
        moreInfoHref={topicUrl("Cabildo Abierto: Popularidad de temas")}
    >
        <div className={"text-[var(--text-light)] space-x-[1px] text-xs flex items-center"} id={"topic-popularity"}>
            <div>{count}</div>
            <div className={"pb-[1px]"}>
                <ValidationIcon
                    fontSize={12}
                    verification={"person"}
                    handle={null}
                />
            </div>
        </div>
    </DescriptionOnHover>
}