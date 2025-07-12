import {useCategories} from "@/queries/api";
import {emptyChar} from "@/utils/utils";
import {useEffect, useState} from "react";
import {ErrorPage} from "../../../modules/ui-utils/src/error-page";
import {useLayoutConfig} from "@/components/layout/layout-config-context";


export const CategorySelector = ({categories, setCategories, multipleEnabled}: {
    categories: string[]
    setCategories: (c: string[]) => void
    multipleEnabled: boolean
}) => {
    let {data: allCategories, isLoading, error} = useCategories()
    const {layoutConfig, isMobile} = useLayoutConfig()
    const [maxCount, setMaxCount] = useState(isMobile ? 5 : 10)

    if(allCategories && categories && categories.some(c => !allCategories.slice(0, maxCount).map(x => x).includes(c))){
        allCategories = [
            ...allCategories.filter(c => categories.includes(c)),
            ...allCategories.filter(c => !categories.includes(c))
        ]
    }

    useEffect(() => {
        const defaultMaxCount = isMobile ? 5 : 10
        if(maxCount < defaultMaxCount) setMaxCount(defaultMaxCount)
    }, [layoutConfig])

    if(isLoading) {
        return <div>{emptyChar}</div>
    } else if(error){
        return <ErrorPage>{error.name}</ErrorPage>
    }

    function onClick(c: string){
        if(categories.includes(c)){
            setCategories(categories.filter(cat => cat != c))
        } else {
            if(!multipleEnabled || c == "Sin categoría"){
                setCategories([c])
            } else {
                setCategories([...categories.filter(x => x != "Sin categoría"), c])
            }
        }
    }

    return <div id="category-selector" className={"flex flex-wrap items-center gap-x-2 gap-y-1 min-[500px]:text-sm text-[11px]"}>
        {allCategories.slice(0, maxCount).map((c, index) => {
            return <button
                key={index}
                className={"rounded-lg px-2 " + (categories.includes(c) ? "bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-[var(--button-text)]" : "text-[var(--text-light)] hover:text-[var(--text)] hover:bg-[var(--background-dark2)] bg-[var(--background-dark)]")}
                onClick={() => {onClick(c)}}
            >
                {c}
            </button>
        })}
        {maxCount < allCategories.length && <div className={"text-[var(--text-light)]"}>
            <button onClick={() => {setMaxCount(maxCount + 10)}} className={"rounded-full hover:bg-[var(--background-dark2)] bg-[var(--background-dark)] px-2"}>
                Ver más
            </button>
        </div>}
    </div>
}