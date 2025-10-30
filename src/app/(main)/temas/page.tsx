"use client"
import {TopicsListView} from "@/components/topics/topics-list-view";
import {TopicsMapView} from "@/components/topics/topics-map-view";
import {useSearchParams} from "next/navigation";
import {CategorySelector} from "@/components/topics/category-selector";
import {updateSearchParam} from "@/utils/fetch";
import TopicsPageTutorial from "@/components/layout/tutorial/topics-tutorial";
import {useTopicsPageParams} from "@/components/config/topics";



const Temas = () => {
    const searchParams = useSearchParams()
    const {categories, sortedBy, multipleEnabled} = useTopicsPageParams()

    function setCategories(newCats: string[]) {
        updateSearchParam("c", newCats)
    }

    function setMultipleEnabled(enabled: boolean) {
        updateSearchParam("m", enabled ? "true" : "false")
    }

    const view = searchParams.get("view")
    return <TopicsPageTutorial>
        <div className={"w-full flex justify-between items-center pt-1 pb-2 px-2"}>
            <div className={"pt-1"}>
                <CategorySelector
                    categories={categories}
                    setCategories={setCategories}
                    multipleEnabled={multipleEnabled}
                    setMultipleEnabled={setMultipleEnabled}
                />
            </div>
        </div>
        {view == "mapa" && <TopicsMapView categories={categories}/>}
        {(!view || view == "lista") && <TopicsListView categories={categories} sortedBy={sortedBy} setCategories={setCategories}/>}
    </TopicsPageTutorial>
}

export default Temas