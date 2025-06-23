"use client"
import {TopicsListView} from "@/components/topics/topics-list-view";
import {TopicsMapView} from "@/components/topics/topics-map-view";
import {useSearchParams} from "next/navigation";
import {useSearch} from "@/components/buscar/search-context";
import {SearchTopics} from "@/components/buscar/search-topics";
import {MobileHeader} from "@/components/layout/mobile-header";
import {TopicsPageHeader} from "@/components/topics/topics-page-header";


const Temas = () => {
    const searchParams = useSearchParams()
    const {searchState} = useSearch()

    const view = searchParams.get("view")
    return <div>
        <MobileHeader/>
        <TopicsPageHeader/>
        {(searchState.value.length == 0 && view == "mapa") && <TopicsMapView/>}
        {(searchState.value.length == 0 && (!view || view == "lista")) && <TopicsListView/>}
        {searchState.searching && <div className={"flex mt-8"}>
            <div className={"w-full"}>
                <SearchTopics/>
            </div>
        </div>}
    </div>
}

export default Temas