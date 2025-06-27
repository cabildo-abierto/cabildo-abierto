import {useRouter} from "next/navigation";
import {useCategoriesGraph} from "@/queries/api";
import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner";
import {ErrorPage} from "../../../modules/ui-utils/src/error-page";
import dynamic from "next/dynamic";

const Graph = dynamic(() => import("./graph-view"));

export const CategoriesMap = () => {
    const {data: graph, isLoading, error} = useCategoriesGraph()
    const router = useRouter()

    function onClickNode(nodeId: string){
        router.push("/temas?c="+nodeId+"&view=mapa")
    }

    if(isLoading){
        return <div className={"mt-16"}>
            <LoadingSpinner/>
        </div>
    } else if(error || !graph) {
        return <ErrorPage>
            {error.message}
        </ErrorPage>
    }

    return <div className={"space-y-8 mb-8"}>
        <div className={"mt-12 w-full flex justify-center max-[500px]:text-lg font-bold text-xl text-[var(--text-light)]"}>
            Categorías
        </div>
        {graph && <Graph
            onClickNode={onClickNode}
            graph={graph}
        />}
        {isLoading && <div className={"mt-16"}>
            <LoadingSpinner/>
        </div>}
        {(error || (!isLoading && !graph)) && <ErrorPage>
            {error.message}
        </ErrorPage>}
    </div>
}