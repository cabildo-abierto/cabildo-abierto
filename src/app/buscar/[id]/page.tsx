import React from "react"
import { ThreeColumnsLayout } from "@/components/main-layout";
import { SearchPageWithInput } from "@/components/search-page-with-input";


const Buscar: React.FC<any> = ({params}) => {
    const center = <SearchPageWithInput initialValue={decodeURIComponent(params.id)}/>

    return <ThreeColumnsLayout center={center}/>
}

export default Buscar
