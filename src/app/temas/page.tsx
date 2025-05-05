"use client"
import {TopicsPageHeader} from "@/components/topics/topics-page-header";
import {TopicsListView} from "@/components/topics/topics-list-view";
import {TopicsMapView} from "@/components/topics/topics-map-view";
import {useSearchParams} from "next/navigation";
import {useSearch} from "@/components/buscar/search-context";
import {SearchTopics} from "@/components/buscar/search-topics";
import {MobileHeader} from "@/components/layout/mobile-header";


const Temas = () => {
    const searchParams = useSearchParams()
    const {searchState} = useSearch()

    const view = searchParams.get("view")
    return <div>
        <MobileHeader/>
        <TopicsPageHeader/>
        {(searchState.value.length == 0 && (!view || view == "mapa")) && <TopicsMapView/>}
        {/*(searchState.value.length == 0 && view == "listas") && <TopicsListsView />*/}
        {(searchState.value.length == 0 && view == "lista") && <TopicsListView/>}
        {searchState.searching && <div className={"flex justify-center mt-8"}>
            <div className={"max-w-[600px]"}>
                <SearchTopics/>
            </div>
        </div>}
    </div>
}

export default Temas