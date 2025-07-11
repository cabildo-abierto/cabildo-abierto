"use client"
import {TopicsListView} from "@/components/topics/topics-list-view";
import {TopicsMapView} from "@/components/topics/topics-map-view";
import {useSearchParams} from "next/navigation";
import {MobileHeader} from "@/components/layout/mobile-header";
import {TopicsPageHeader} from "@/components/topics/topics-page-header";
import {useState} from "react";
import {TopicsSortOrder} from "@/components/topics/topic-sort-selector";
import {CategorySelector} from "@/components/topics/category-selector";
import {updateSearchParam} from "@/utils/fetch";


const Temas = () => {
    const searchParams = useSearchParams()
    const categories = searchParams.getAll("c")
    const [sortedBy, setSortedBy] = useState<TopicsSortOrder>("Populares última semana")
    const [multipleEnabled, setMultipleEnabled] = useState(false)

    function setCategories(newCats: string[]) {
        updateSearchParam("c", newCats)
    }

    const view = searchParams.get("view")
    return <div>
        <MobileHeader/>
        <TopicsPageHeader sortedBy={sortedBy} setSortedBy={setSortedBy} multipleEnabled={multipleEnabled} setMultipleEnabled={setMultipleEnabled}/>
        <div className={"w-full flex justify-between items-center pt-1 pb-2 px-2"}>
            <div className={"pt-1"}>
                <CategorySelector
                    categories={categories}
                    setCategories={setCategories}
                    multipleEnabled={multipleEnabled}
                />
            </div>
        </div>
        {view == "mapa" && <TopicsMapView categories={categories}/>}
        {(!view || view == "lista") && <TopicsListView categories={categories} sortedBy={sortedBy} setCategories={setCategories}/>}
    </div>
}

export default Temas