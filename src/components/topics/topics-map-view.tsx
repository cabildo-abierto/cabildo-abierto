"use client"
import {useSearchParams} from "next/navigation";
import {CategoriesMap} from "./categories-map";
import {CategoryMap} from "./category-map";



export const TopicsMapView = () => {
    const searchParams = useSearchParams()

    const c = searchParams.get("c")

    if(c){
        return <CategoryMap c={c}/>
    } else {
        return <CategoriesMap/>
    }
}