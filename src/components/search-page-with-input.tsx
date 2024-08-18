"use client"

import React, { useState } from "react"
import SearchPage from "@/components/search-page";
import { SearchInput } from "@/components/searchbar";
import { SearchButton } from "@/components/top-bar";
import { useRouter } from "next/navigation";


export const SearchPageWithInput = ({initialValue}: {initialValue: string}) => {
    const [value, setValue] = useState("")
    const router = useRouter()

    return <>
        <div className="flex justify-center py-2">
            <div className="flex rounded px-2 border">
        <SearchInput onChange={(e: any) => {setValue(e.target.value)}} border={true}/>
        <SearchButton onClick={() => {router.push("/buscar/"+encodeURIComponent(value))}}/>
        </div></div>
        <div className="py-4">
            <h2>Buscando <span className="italic">{initialValue}</span></h2>
        </div>
        <SearchPage searchValue={initialValue}/>
    </>
}