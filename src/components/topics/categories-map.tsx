import Graph from "./graph";
import {useRouter} from "next/navigation";
import {useCategoriesGraph} from "../../hooks/api";
import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner";


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
        <div className={"mt-12 w-full flex justify-center ml-6 max-[500px]:text-xl font-bold text-lg text-[var(--text-light)]"}>
            Categorías
        </div>
        <Graph
            nodeIds={graph.nodeIds}
            edgesList={graph.edges}
            onClickNode={onClickNode}
            nodeLabels={graph.nodeLabels ? new Map(graph.nodeLabels.map(({id, label}) => ([id, label]))) : undefined}
        />
    </div>
}