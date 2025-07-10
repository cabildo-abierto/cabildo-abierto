import DescriptionOnHover from "../../../../modules/ui-utils/src/description-on-hover";
import {topicUrl} from "@/utils/uri";
import ValidationIcon from "@/components/profile/validation-icon";


export default function TopicPopularity({count, paddingBottom=3}: {count: number, paddingBottom?: number}) {

    return <DescriptionOnHover
        description={`${count} persona${count == 1 ? " participó" : "s participaron"} en la discusión sobre el tema.`}
        moreInfoHref={topicUrl("Cabildo Abierto: Popularidad de temas")}
    >
        <div className={"text-[var(--text-light)] text-xs flex items-end"}>
            <div>{count}</div>
            <div style={{paddingBottom}}> {/*Por algún motivo se ve distinto en el slider*/}
                <ValidationIcon
                    fontSize={10}
                    validation={"person"}
                    handle={null}
                    color={"background-dark"}
                />
            </div>
        </div>
    </DescriptionOnHover>
}