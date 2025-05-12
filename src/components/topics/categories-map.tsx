import {useRouter} from "next/navigation";
import {useCategoriesGraph} from "@/hooks/api";
import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner";
import {ErrorPage} from "../../../modules/ui-utils/src/error-page";
import dynamic from "next/dynamic";

const Graph = dynamic(() => import("./graph"));

export const CategoriesMap = () => {
    const {data: graph, isLoading, error} = useCategoriesGraph()
    const router = useRouter()

    if(isLoading){
        return <div className={"mt-16"}>
            <LoadingSpinner/>
        </div>
    } else if(error || !graph) {
        return <ErrorPage>
            {error.message}
        </ErrorPage>
    }

    function onClickNode(nodeId: string){
        router.push("/temas?c="+nodeId+"&view=mapa")
    }

    return <div className={"space-y-8 mb-8"}>
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