import DescriptionOnHover from "../../../../modules/ui-utils/src/description-on-hover";
import {topicUrl} from "@/utils/uri";


export default function TopicPopularity({count}: {count: number}) {

    return <DescriptionOnHover
        description={`${count} personas participaron en la discusión sobre el tema.`}
        moreInfoHref={topicUrl("Cabildo Abierto: Popularidad de temas")}
    >
        <div className={"text-[var(--text-light)] text-xs flex items-center"}>
            <div>{count}p</div>
        </div>
    </DescriptionOnHover>
}