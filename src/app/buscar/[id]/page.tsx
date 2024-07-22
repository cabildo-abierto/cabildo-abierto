import React from "react"
import { ThreeColumnsLayout } from "@/components/main-layout";
import { requireSubscription } from "@/components/utils";
import SearchPage from "@/components/search-page";


const Buscar: React.FC = async ({params}) => {

    const searchValue = decodeURIComponent(params.id)

    const center = <>
        <div className="py-4">
            <h2>Buscando <span className="italic">{searchValue}</span></h2>
        </div>
        <SearchPage searchValue={searchValue}/>
    </>

    return requireSubscription(<ThreeColumnsLayout center={center}/>, true)
}

export default Buscar
