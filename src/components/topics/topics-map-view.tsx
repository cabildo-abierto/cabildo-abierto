import {CategoriesMap} from "./categories-map";
import {CategoryMap} from "./category-map";



export const TopicsMapView = ({categories}: {categories: string[]}) => {

    if(categories.length > 0){
        return <CategoryMap categories={categories}/>
    } else {
        return <CategoriesMap/>
    }
}