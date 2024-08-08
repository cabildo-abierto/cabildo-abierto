import React from "react"
import { ThreeColumnsLayout } from "@/components/main-layout";
import { getContentsMap } from "@/components/update-context";
import { SearchPageWithInput } from "@/components/search-page-with-input";


const Buscar: React.FC<any> = async ({params}) => {
    const contents = await getContentsMap()
    
    const center = <SearchPageWithInput contents={contents} initialValue={decodeURIComponent(params.id)}/>

    return <ThreeColumnsLayout center={center}/>
}

export default Buscar
