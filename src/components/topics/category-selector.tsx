import {useCategories} from "@/queries/getters/useTopics";
import {emptyChar} from "@/utils/utils";
import React, {useEffect, useMemo, useState} from "react";
import {ErrorPage} from "../../../modules/ui-utils/src/error-page";
import {useLayoutConfig} from "@/components/layout/layout-config-context";
import SearchIcon from "@mui/icons-material/Search";
import {cleanText} from "@/utils/strings";
import {TextField} from "../../../modules/ui-utils/src/text-field";


export const CategorySelector = ({categories, setCategories, multipleEnabled}: {
    categories: string[]
    setCategories: (c: string[]) => void
    multipleEnabled: boolean
}) => {
    let {data: allCategories, isLoading, error} = useCategories()
    const {layoutConfig, isMobile} = useLayoutConfig()
    const [maxCount, setMaxCount] = useState(isMobile ? 5 : 10)
    const [categorySearch, setCategorySearch] = useState("")

    if (allCategories && categories && categories.some(c => !allCategories.slice(0, maxCount).map(x => x).includes(c))) {
        allCategories = [
            ...allCategories.filter(c => categories.includes(c)),
            ...allCategories.filter(c => !categories.includes(c))
        ]
    }

    useEffect(() => {
        const defaultMaxCount = isMobile ? 5 : 10
        if (maxCount < defaultMaxCount) setMaxCount(defaultMaxCount)
    }, [layoutConfig])

    const filteredCategories = useMemo(() => {
        if (allCategories) {
            return allCategories.filter(c => {
                return cleanText(c).includes(cleanText(categorySearch))
            })
        }
    }, [allCategories, categorySearch])

    if (isLoading) {
        return <div>{emptyChar}</div>
    } else if (error) {
        return <ErrorPage>{error.name}</ErrorPage>
    }

    function onClick(c: string) {
        if (categories.includes(c)) {
            setCategories(categories.filter(cat => cat != c))
        } else {
            if (!multipleEnabled || c == "Sin categoría") {
                setCategories([c])
            } else {
                setCategories([...categories.filter(x => x != "Sin categoría"), c])
            }
        }
    }

    return <div id="category-selector"
                className={"flex flex-wrap items-center gap-x-2 gap-y-1 min-[500px]:text-sm text-[11px]"}>
        <div className={"w-36"}>
            <TextField
                variant={"outlined"}
                paddingY={"0px"}
                paddingX={"6px"}
                size={"small"}
                fontSize={13}
                autoComplete={"off"}
                borderWidth={1}
                borderColor={"accent"}
                borderWidthNoFocus={1}
                value={categorySearch}
                onChange={(e) => {
                    setCategorySearch(e.target.value)
                }}
                slotProps={{
                    input: {
                        startAdornment: <span
                            className={"text-[var(--text-light)] mr-1 " + (isMobile ? "text-xs" : "text-sm")}>
                        <SearchIcon fontSize="inherit" color={"inherit"}/></span>,
                    }
                }}
                placeholder={"buscar categoría..."}
            />
        </div>
        {filteredCategories && filteredCategories.slice(0, maxCount).map((c, index) => {
            return <button
                key={index}
                className={(categories.includes(c) ? "font-light bg-[var(--background-dark2)] hover:bg-[var(--background-dark3)]" : "text-[var(--text-light)] hover:text-[var(--text)] hover:bg-[var(--background-dark)]")}
                onClick={() => {
                    onClick(c)
                }}
            >
                {c}
            </button>
        })}
        {filteredCategories && maxCount < filteredCategories.length && <div className={"text-[var(--text-light)]"}>
            <button onClick={() => {
                setMaxCount(maxCount + 10)
            }}
                    className={"font-light hover:bg-[var(--background-dark)]"}>
                Ver más
            </button>
        </div>}
    </div>
}