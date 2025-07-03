import {useRouter} from "next/navigation";
import {useCategoryGraph} from "@/queries/api";
import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner";
import {topicUrl} from "@/utils/uri";
import {ErrorPage} from "../../../modules/ui-utils/src/error-page";
import dynamic from "next/dynamic";
import {useSearch} from "@/components/buscar/search-context";
import {useMemo} from "react";
import {TopicsGraph} from "@/lib/types";
import {cleanText} from "@/utils/strings";

const Graph = dynamic(() => import("./graph-view"));

export const CategoryMap = ({categories}: {categories: string[]}) => {
    const router = useRouter()
    const {data: graph, isLoading, error} = useCategoryGraph(categories)
    const {searchState} = useSearch()

    function onClickNode(nodeId: string){
        router.push(topicUrl(nodeId))
    }

    const filteredGraph = useMemo(() => {
        if(searchState.searching && searchState.value.length > 0 && graph){
            const query = cleanText(searchState.value)

            const nodeFilter = (n: string) => cleanText(n).includes(query)

            const filteredGraph: TopicsGraph = {
                nodeIds: graph.nodeIds.filter(nodeFilter),
                edges: graph.edges.filter(n => nodeFilter(n.x) && nodeFilter(n.y))
            }

            return filteredGraph
        } else {
            return graph
        }
    }, [searchState, graph])

    return <div className={"mt-12 ml-6 space-y-8 mb-8"}>
        {filteredGraph && <Graph
            onClickNode={onClickNode}
            graph={filteredGraph}
        />}
        {isLoading && <div className={"h-[600px] flex items-center justify-center"}>
            <LoadingSpinner/>
        </div>}
        {(error || (!isLoading && !graph)) && <ErrorPage>
            {error.message}
        </ErrorPage>}
    </div>
}