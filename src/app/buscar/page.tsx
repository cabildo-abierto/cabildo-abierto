"use client"
import SearchBar from "../../components/searchbar";
import {useEffect} from "react";
import {useSearch} from "../../components/search-context";
import {SearchContent} from "../../components/search-content";


const Page = ({searchParams}: {searchParams: {q: string}}) => {
    const {setSearchState} = useSearch()

    useEffect(() => {
        if(searchParams.q && searchParams.q.length > 0){
            setSearchState({searching: true, value: searchParams.q})
        } else {
            setSearchState({searching: false, value: ""})
        }
    }, [searchParams])

    return <div className={""}>
        <div className={"p-3"}>
            <SearchBar onClose={() => {}} wideScreen={false} className={"h-10"}/>
        </div>
        <div>
            <SearchContent route={[]} setRoute={(v: string[]) => {}}/>
        </div>
    </div>
}


export default Page