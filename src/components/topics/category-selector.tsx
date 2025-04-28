import {useCategories} from "@/hooks/api";
import {emptyChar} from "@/utils/utils";
import {useState} from "react";
import AddIcon from "@mui/icons-material/Add";
import {ErrorPage} from "../../../modules/ui-utils/src/error-page";


export const CategorySelector = ({categories, setCategories}: {
    categories: string[], setCategories: (c: string[]) => void
}) => {
    const {data: allCategories, isLoading, error} = useCategories()
    const [maxCount, setMaxCount] = useState(10)

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

    return <div className={"flex flex-wrap items-center gap-x-2 gap-y-1"}>
        {allCategories.slice(0, maxCount).map(({category: c}, index) => {
            return <button
                key={index}
                className={"rounded-lg min-[500px]:text-sm text-xs px-2 " + (categories.includes(c) ? "bg-[var(--primary)] hover:bg-[var(--primary-dark)]" : "text-[var(--text-light)] hover:text-[var(--text)] hover:bg-[var(--background-dark4)] bg-[var(--background-dark2)]")}
                onClick={() => {onClick(c)}}
            >
                {c}
            </button>
        })}
        {maxCount < allCategories.length && <div className={"text-[var(--text-light)] text-[14px]"}>
            <button onClick={() => {setMaxCount(maxCount + 10)}} className={"rounded-full hover:bg-[var(--background-dark2)] bg-[var(--background-dark)] px-1"}>
            <AddIcon fontSize={"inherit"}/>
        </button>
        </div>}

    </div>
}