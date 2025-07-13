import DescriptionOnHover from "../../../../modules/ui-utils/src/description-on-hover";
import {topicUrl} from "@/utils/uri";
import ValidationIcon from "@/components/profile/validation-icon";
import {TopicPopularity} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";
import {TimePeriod} from "@/queries/api";


export default function TopicPopularityIndicator({counts, selected, paddingBottom=3}: {counts: TopicPopularity, selected: TimePeriod, paddingBottom?: number}) {

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
        <div className={"text-[var(--text-light)] text-xs flex items-end"} id={"topic-popularity"}>
            <div>{count}</div>
            <div style={{paddingBottom}}> {/*Por algún motivo se ve distinto en el slider*/}
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