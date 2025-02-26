import {BackButton} from "../back-button";
import Graph from "./graph";
import {topicUrl} from "../utils";
import {useRouter} from "next/navigation";
import {useCategoryGraph} from "../../hooks/contents";
import LoadingSpinner from "../loading-spinner";


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

    return <div className={"mt-6 ml-6"}>
        <div className={"flex space-x-2 items-center py-1"}>
            <BackButton url={"/temas?view=mapa"}/>
            <h2>
                {c}
            </h2>
        </div>
        <Graph
            nodeIds={graph.nodeIds}
            edgesList={graph.edges}
            onClickNode={onClickNode}
        />
    </div>
}