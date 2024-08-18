import React from "react"
import { ThreeColumnsLayout } from "@/components/three-columns";
import { WikiCategories } from "@/components/wiki-categories";


const TopicsPage: React.FC<{
    params: {route: string[]}
}> = async ({params}) => {

    const decodedRoute = params.route ? params.route.map(decodeURIComponent) : []

    const center = <div className="w-full">
        <h1 className="ml-2 py-8 flex justify-center">
            {decodedRoute.length > 0 ? "Categoría: "+ decodedRoute.join(" > ") : "Artículos colaborativos"}
        </h1>
        <div>
            <WikiCategories route={decodedRoute}/>
        </div>
    </div>

    return <ThreeColumnsLayout center={center} />
}
export default TopicsPage