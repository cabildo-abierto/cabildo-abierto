"use client"
import React, { useState } from "react"
import { ThreeColumnsLayout } from "@/components/main-layout";
import SearchPage from "@/components/search-page";
import { SearchInput } from "@/components/searchbar";
import { SearchButton } from "@/components/top-bar";
import { useRouter } from "next/navigation";


const Buscar: React.FC<any> = ({params}) => {
    const [value, setValue] = useState("")
    const router = useRouter()

    const searchValue = decodeURIComponent(params.id)

    const center = <>
        <div className="flex justify-center py-2">
            <div className="flex rounded px-2 border">
        <SearchInput onChange={(e: any) => {setValue(e.target.value)}} border={true}/>
        <SearchButton onClick={() => {router.push("/buscar/"+encodeURIComponent(value))}}/>
        </div></div>
        <div className="py-4">
            <h2>Buscando <span className="italic">{searchValue}</span></h2>
        </div>
        <SearchPage searchValue={searchValue}/>
    </>

    return <ThreeColumnsLayout center={center}/>
}

export default Buscar
