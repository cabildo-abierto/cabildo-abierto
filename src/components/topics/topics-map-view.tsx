"use client"
import {useMapTopics} from "../../hooks/contents";
import LoadingSpinner from "../loading-spinner";
import {MapTopicProps} from "../../app/lib/definitions";
import {contentUrl, currentCategories, shuffleArray, topicUrl} from "../utils";
import Graph from "./graph";
import {useRouter, useSearchParams} from "next/navigation";
import {BackButton} from "../back-button";


function getTopicsGraphForCategory(topics: MapTopicProps[], cat: string): {edges: {x: string, y: string}[], nodes: string[]} {
    const topicToCategoriesMap = new Map<string, string[]>()

    const topicsInCategory = new Set<string>()
    for(let i = 0; i < topics.length; i++) {
        const c = currentCategories(topics[i])
        topicToCategoriesMap.set(topics[i].id, c)
        if(c.includes(cat)){
            topicsInCategory.add(topics[i].id)
        }
    }

    const edges = []
    for(let i = 0; i < topics.length; i++) {
        const yId = topics[i].id
        const catY = topicToCategoriesMap.get(yId)
        if(!catY.includes(cat)) continue

        for(let j = 0; j < topics[i].referencedBy.length; j++){
            if(topics[i].referencedBy[j].referencingContent.topicVersion){
                const xId = topics[i].referencedBy[j].referencingContent.topicVersion.topicId
                const catX = topicToCategoriesMap.get(xId)
                if(!catX.includes(cat)) continue

                edges.push({
                    x: xId,
                    y: yId,
                })
            }
        }
    }
    return {
        nodes: Array.from(topicsInCategory).slice(0, 500),
        edges: edges.slice(0, 100)
    }
}


function getCategoriesGraph(topics: MapTopicProps[]): {edges: {x: string, y: string}[], nodes: string[], nodeLabels: Map<string, string>} {

    const topicToCategoriesMap = new Map<string, string[]>()

    const categories = new Map<string, number>()
    for(let i = 0; i < topics.length; i++) {
        const cats = currentCategories(topics[i])
        topicToCategoriesMap.set(topics[i].id, cats)
        cats.forEach((c) => {
            if(!categories.has(c)) categories.set(c, 1)
            else categories.set(c, categories.get(c)+1)
        })
    }

    const edges: {x: string, y: string}[] = []
    for(let i = 0; i < topics.length; i++) {
        const yId = topics[i].id
        const catsY = topicToCategoriesMap.get(yId)

        for(let j = 0; j < topics[i].referencedBy.length; j++){
            if(topics[i].referencedBy[j].referencingContent.topicVersion){
                const xId = topics[i].referencedBy[j].referencingContent.topicVersion.topicId
                const catsX = topicToCategoriesMap.get(xId)

                catsX.forEach((catX) => {
                    catsY.forEach((catY) => {
                        if(catX != catY && !edges.some(({x, y}) => (x == catX && y == catY))){
                            edges.push({x: catX, y: catY})
                        }
                    })
                })
            }
        }
    }

    const nodeLabels = new Map<string, string>()
    categories.entries().forEach(([cat, k]) => {
        nodeLabels.set(cat, cat + " (" + k + ")")
    })

    return {edges: edges, nodes: Array.from(categories.keys()), nodeLabels}
}


export const TopicsMapView = () => {
    const {topics} = useMapTopics()
    const searchParams = useSearchParams()
    const router = useRouter()

    if(!topics){
        return <div className={"mt-8"}>
            <LoadingSpinner/>
        </div>
    }

    const c = searchParams.get("c")

    function onClickNode(nodeId: string){
        if(c){
            router.push(topicUrl(nodeId))
        } else {
            router.push("/temas?c="+nodeId+"&view=mapa")
        }
    }

    if(c){
        const {edges, nodes} = getTopicsGraphForCategory(topics, c)

        return <div className={"mt-6 ml-6"}>
            <div className={"flex space-x-2 items-center py-1"}>
                <BackButton url={"/temas?view=mapa"}/>
                <h2>
                    {c}
                </h2>
            </div>
            <Graph
                nodeIds={nodes}
                edgesList={edges}
                onClickNode={onClickNode}
            />
        </div>
    } else {
        const {nodes, edges, nodeLabels} = getCategoriesGraph(topics)

        return <div className={"mt-6 ml-6"}>
            <h2>
                Categorías
            </h2>
            <Graph
                nodeIds={nodes}
                edgesList={edges}
                onClickNode={onClickNode}
                nodeLabels={nodeLabels}
            />
        </div>
    }

}