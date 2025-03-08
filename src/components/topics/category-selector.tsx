"use client"
import {useCategories} from "../../hooks/contents";


export const CategorySelector = ({categories, setCategories}: {
    categories: string[], setCategories: (c: string[]) => void
}) => {
    const {categories: allCategories, isLoading} = useCategories()

    if(isLoading) {
        return <></>
    }

    function onClick(c: string){
        if(!categories.includes(c)){
            setCategories([...categories, c])
        } else {
            setCategories(categories.filter(cat => cat != c))
        }
    }

    return <div className={"flex flex-wrap items-center gap-x-2 gap-y-1"}>
        {allCategories.map(({category: c}, index) => {
            return <button
                key={index}
                className={"rounded-lg text-sm px-2 " + (categories.includes(c) ? "bg-[var(--primary)] hover:bg-[var(--primary-dark)]" : "text-[var(--text-light)] hover:text-[var(--text)] hover:bg-[var(--background-dark4)] bg-[var(--background-dark2)]")}
                onClick={() => {onClick(c)}}>
                {c}
            </button>
        })}
    </div>
}