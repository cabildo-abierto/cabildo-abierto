import {BackButton} from "../../../modules/ui-utils/src/back-button";
import Graph from "./graph";
import {useRouter} from "next/navigation";
import {useCategoryGraph} from "@/hooks/api";
import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner";
import {topicUrl} from "@/utils/uri";


export const CategoryMap = ({c}: {c: string}) => {
    const router = useRouter()
    const {graph} = useCategoryGraph(c)

    function onClickNode(nodeId: string){
        router.push(topicUrl(nodeId))
    }

    if(!graph){
        return <div className={"mt-16"}>
            <LoadingSpinner/>
        </div>
    }

    return <div className={"mt-12 ml-6"}>
        <div className={"flex space-x-2 items-center text-[var(--text-light)] justify-center"}>
            <BackButton defaultURL={"/temas?view=mapa"}/>
            <div className={"text-lg font-bold"}>
                {c}
            </div>
        </div>
        <Graph
            nodeIds={graph.nodeIds}
            edgesList={graph.edges}
            onClickNode={onClickNode}
        />
    </div>
}