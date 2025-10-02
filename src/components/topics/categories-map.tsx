import {usePathname, useRouter} from "next/navigation";
import {useCategoriesGraph} from "@/queries/getters/useTopics";
import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner";
import {ErrorPage} from "../../../modules/ui-utils/src/error-page";
import dynamic from "next/dynamic";
import {useSearch} from "@/components/buscar/search-context";
import {useMemo} from "react";
import {cleanText} from "@/utils/strings";
import {TopicsGraph} from "@/lib/types";

const Graph = dynamic(() => import("./graph-view"));

export const CategoriesMap = () => {
    const {data: graph, isLoading, error} = useCategoriesGraph()
    const router = useRouter()
    const pathname = usePathname()
    const {searchState} = useSearch(`${pathname}::topics`)

    function onClickNode(nodeId: string){
        router.push("/temas?c="+nodeId+"&view=mapa")
    }

    const filteredGraph = useMemo(() => {
        if(searchState.searching && searchState.value.length > 0 && graph){
            const query = cleanText(searchState.value)

            const nodeFilter = (n: string) => cleanText(n).includes(query)

            const filteredGraph: TopicsGraph = {
                nodeIds: graph.nodeIds.filter(nodeFilter),
                edges: graph.edges.filter(n => nodeFilter(n.x) && nodeFilter(n.y)),
                data: graph.data
            }

            return filteredGraph
        } else {
            return graph
        }
    }, [searchState, graph])

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
        {filteredGraph && <Graph
            onClickNode={onClickNode}
            graph={filteredGraph}
        />}
        {isLoading && <div className={"mt-16"}>
            <LoadingSpinner/>
        </div>}
        {(error || (!isLoading && !filteredGraph)) && <ErrorPage>
            {error.message}
        </ErrorPage>}
    </div>
}