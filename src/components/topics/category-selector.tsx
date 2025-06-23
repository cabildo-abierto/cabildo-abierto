import {useCategories} from "@/queries/api";
import {emptyChar} from "@/utils/utils";
import {useEffect, useState} from "react";
import {ErrorPage} from "../../../modules/ui-utils/src/error-page";
import {useLayoutConfig} from "@/components/layout/layout-config-context";
import {pxToNumber} from "@/utils/strings";


export const CategorySelector = ({categories, setCategories}: {
    categories: string[], setCategories: (c: string[]) => void
}) => {
    const {data: allCategories, isLoading, error} = useCategories()
    const {layoutConfig} = useLayoutConfig()
    const [maxCount, setMaxCount] = useState(pxToNumber(layoutConfig.maxWidthCenter) < 600 ? 5 : 10)

    useEffect(() => {
        const defaultMaxCount = pxToNumber(layoutConfig.maxWidthCenter) < 600 ? 5 : 10
        if(maxCount < defaultMaxCount) setMaxCount(defaultMaxCount)
    }, [layoutConfig])

    if(isLoading) {
        return <div>{emptyChar}</div>
    } else if(error){
        return <ErrorPage>{error.name}</ErrorPage>
    }

    function onClick(c: string){
        if(!categories.includes(c)){
            setCategories([...categories, c])
        } else {
            setCategories(categories.filter(cat => cat != c))
        }
    }

    return <div className={"flex flex-wrap items-center gap-x-2 gap-y-1 min-[500px]:text-sm text-[11px]"}>
        {allCategories.slice(0, maxCount).map(({category: c}, index) => {
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