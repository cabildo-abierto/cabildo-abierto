import {usePathname, useRouter} from "next/navigation";
import {useCategoryGraph} from "@/queries/getters/useTopics";
import {LoadingSpinner} from "@/components/utils/base/loading-spinner";
import {topicUrl} from "@/components/utils/react/url";
import {ErrorPage} from "../../utils/error-page";
import dynamic from "next/dynamic";
import {useSearch} from "../../buscar/search-context";
import {useMemo} from "react";
import {TopicsGraph} from "@/lib/types";
import {cleanText} from "@cabildo-abierto/utils/dist/strings";

const Graph = dynamic(() => import("@/components/visualizations/visualization/topics-graph/graph-view").then(mod => mod.GraphView), {ssr: false})

export const CategoryMap = ({categories}: {categories: string[]}) => {
    const router = useRouter()
    const {data: graph, isLoading, error} = useCategoryGraph(categories)
    const pathname = usePathname()
    const {searchState} = useSearch(`${pathname}::topics`)

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

    return <div className={"mt-12 mb-8"}>
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