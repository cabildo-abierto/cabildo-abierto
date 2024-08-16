import React from "react"
import { ThreeColumnsLayout } from "@/components/main-layout";
import { getContentsMap, getEntitiesMap } from "@/components/update-context";
import { WikiCategories } from "@/components/wiki-categories";


const TopicsPage: React.FC<{
    params: {route: string[]}
}> = async ({params}) => {
    const contents = await getContentsMap()
    const entities = await getEntitiesMap()

    const decodedRoute = params.route ? params.route.map(decodeURIComponent) : []

    const center = <div className="w-full">
        <h1 className="ml-2 py-8 flex justify-center">
            {decodedRoute ? "Categoría: "+ decodedRoute.join(" > ") : "Artículos colaborativos"}
        </h1>
        <div>
            <WikiCategories entities={entities} route={decodedRoute} contents={contents}/>
        </div>
    </div>

    return <ThreeColumnsLayout center={center} />
}
export default TopicsPage