import {BackButton} from "../../../modules/ui-utils/src/back-button";
import {useRouter} from "next/navigation";
import {useCategoryGraph} from "@/queries/api";
import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner";
import {topicUrl} from "@/utils/uri";
import {ErrorPage} from "../../../modules/ui-utils/src/error-page";
import dynamic from "next/dynamic";

const Graph = dynamic(() => import("./graph"));

export const CategoryMap = ({c}: {c: string}) => {
    const router = useRouter()
    const {data: graph, isLoading, error} = useCategoryGraph(c)

    function onClickNode(nodeId: string){
        router.push(topicUrl(nodeId))
    }

    return <div className={"mt-12 ml-6 space-y-8 mb-8"}>
        <div className={"flex space-x-2 items-center text-[var(--text-light)] justify-center"}>
            <BackButton defaultURL={"/temas?view=mapa"}/>
            <div className={"text-lg font-bold"}>
                {c}
            </div>
        </div>
        {graph && <Graph
            onClickNode={onClickNode}
            graph={graph}
        />}
        {isLoading && <div className={"h-[600px] flex items-center justify-center"}>
            <LoadingSpinner/>
        </div>}
        {(error || (!isLoading && !graph)) && <ErrorPage>
            {error.message}
        </ErrorPage>}
    </div>
}