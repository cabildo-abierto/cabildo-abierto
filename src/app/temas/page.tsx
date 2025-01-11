"use client"
import { useState } from "react"
import { CategoryArticles } from "../../components/category-articles"


const Temas = () => {
    const [route, setRoute] = useState([])

    return <div>
        {/*<div className="bg-[var(--content)] content-container  rounded mt-1">
            <span className="text-[var(--text-light)] px-2 sm:text-sm text-xs">Categoría</span>
            <Route route={route} setRoute={setRoute}/>
        </div>*/}
        <CategoryArticles route={route} onSearchPage={false}/>
    </div>
}

export default Temas