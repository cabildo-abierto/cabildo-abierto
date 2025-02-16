"use client"
import {useCategories} from "../../hooks/contents";


export const CategorySelector = ({categories, setCategories}: {categories: string[], setCategories: (c: string[]) => void}) => {
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
        {allCategories.map((c, index) => {
            return <button
                key={index}
                className={"rounded-lg text-sm text-[var(--text-light)] bg-[var(--background-dark2)] px-2 hover:bg-[var(--background-dark3)] " + (categories.includes(c) ? "bg-[var(--accent-dark)]" : "")}
                onClick={() => {onClick(c)}}>
                {c}
            </button>
        })}
    </div>
}