import React from "react"
import { ThreeColumnsLayout } from "@/components/main-layout";
import SearchPage from "@/components/search-page";


const Buscar: React.FC<any> = async ({params}) => {

    const searchValue = decodeURIComponent(params.id)

    const center = <>
        <div className="py-4">
            <h2>Buscando <span className="italic">{searchValue}</span></h2>
        </div>
        <SearchPage searchValue={searchValue}/>
    </>

    return <ThreeColumnsLayout center={center}/>
}

export default Buscar
