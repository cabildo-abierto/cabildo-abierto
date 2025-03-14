import Graph from "./graph";
import {useRouter} from "next/navigation";
import {useCategoriesGraph} from "../../hooks/contents";
import LoadingSpinner from "../ui-utils/loading-spinner";


export const CategoriesMap = () => {
    const {graph} = useCategoriesGraph()
    const router = useRouter()

    if(!graph){
        return <div className={"mt-16"}>
            <LoadingSpinner/>
        </div>
    }

    function onClickNode(nodeId: string){
        router.push("/temas?c="+nodeId+"&view=mapa")
    }

    return <div className={""}>
        <h2 className={"mt-6 ml-6"}>
            Categorías
        </h2>
        <Graph
            nodeIds={graph.nodeIds}
            edgesList={graph.edges}
            onClickNode={onClickNode}
            nodeLabels={graph.nodeLabels ? new Map(graph.nodeLabels.map(({id, label}) => ([id, label]))) : undefined}
        />
    </div>
}