import {EngagementProps, VisualizationProps} from "@/lib/types";
import {CardFeed} from "../../../modules/ui-utils/src/card-feed";
import {VisualizationCard} from "./visualization-card";


export const VisualizationsFeed = ({visualizations}: {visualizations: (VisualizationProps & EngagementProps)[]}) => {
    function generator(e: any, width: number) {
        return <VisualizationCard visualization={e} width={width}/>
    }

    return <CardFeed
        elements={visualizations}
        generator={generator}
    />
}