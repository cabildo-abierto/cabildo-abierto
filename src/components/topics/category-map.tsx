import {BackButton} from "../../../modules/ui-utils/src/back-button";
import Graph from "./graph";
import {useRouter} from "next/navigation";
import {useCategoryGraph} from "@/hooks/api";
import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner";
import {topicUrl} from "@/utils/uri";
import {ErrorPage} from "../../../modules/ui-utils/src/error-page";


export const CategoryMap = ({c}: {c: string}) => {
    const router = useRouter()
    const {data: graph, isLoading, error} = useCategoryGraph(c)

    function onClickNode(nodeId: string){
        router.push(topicUrl(nodeId))
    }

    if(isLoading){
        return <div className={"mt-16"}>
            <LoadingSpinner/>
        </div>
    } else if (error) {
        return <ErrorPage>
            {error.message}
        </ErrorPage>
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