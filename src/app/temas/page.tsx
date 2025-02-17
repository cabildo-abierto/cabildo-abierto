"use client"
import { useState } from "react"
import { CategoryArticles } from "../../components/category-articles"
import {CategorySelector} from "../../components/categories/category-selector";
import {TopicsPageHeader, TopicsSortOrder} from "../../components/topics-page-header";


const Temas = () => {
    const [categories, setCategories] = useState([])
    const [sortedBy, setSortedBy] = useState<TopicsSortOrder>("Populares")

    return <div>
        <TopicsPageHeader
            sortedBy={sortedBy}
            setSortedBy={setSortedBy}
        />
        <div className={"px-2 py-3"}>
            <CategorySelector categories={categories} setCategories={setCategories}/>
        </div>
        <CategoryArticles sortedBy={sortedBy} categories={categories} onSearchPage={false}/>
    </div>
}

export default Temas