"use client"
import {MainSearchBar} from "@/components/buscar/search-bar";
import {SearchContent} from "@/components/buscar/search-content";
import {SmallBackButtonHeader} from "@/components/layout/small-back-button-header";
import {useSearchParams} from "next/navigation";
import {useEffect} from "react";
import {useSearch} from "@/components/buscar/search-context";


const Page = () => {
    const params = useSearchParams()
    const {setSearchState} = useSearch()

    useEffect(() => {
        const q = params.get("q")
        if(q){
            setSearchState({
                value: q,
                searching: true
            })
        }
    }, [params]);

    return <div className={"flex flex-col items-center"}>
        <div className={"min-[500px]:hidden w-full px-2"}>
            <SmallBackButtonHeader title={"Buscar"}/>
        </div>
        <div className={"p-2 w-full max-w-[560px]"}>
            <MainSearchBar autoFocus={true}/>
        </div>
        <div className={"w-full"}>
            <SearchContent query={params.get("q")}/>
        </div>
    </div>
}


export default Page