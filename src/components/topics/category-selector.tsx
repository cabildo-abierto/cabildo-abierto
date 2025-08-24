import {useCategories} from "@/queries/useTopics";
import {emptyChar} from "@/utils/utils";
import React, {useEffect, useMemo, useState} from "react";
import {ErrorPage} from "../../../modules/ui-utils/src/error-page";
import {useLayoutConfig} from "@/components/layout/layout-config-context";
import {TextField} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import {cleanText} from "@/utils/strings";


export const CategorySelector = ({categories, setCategories, multipleEnabled}: {
    categories: string[]
    setCategories: (c: string[]) => void
    multipleEnabled: boolean
}) => {
    let {data: allCategories, isLoading, error} = useCategories()
    const {layoutConfig, isMobile} = useLayoutConfig()
    const [maxCount, setMaxCount] = useState(isMobile ? 5 : 10)
    const [categorySearch, setCategorySearch] = useState("")

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

    const filteredCategories = useMemo(() => {
        if(allCategories){
            return allCategories.filter(c => {
                return cleanText(c).includes(cleanText(categorySearch))
            })
        }
    }, [allCategories, categorySearch])

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
        <TextField
            variant="outlined"
            value={categorySearch}
            onChange={(e) => {
                setCategorySearch(e.target.value)
            }}
            slotProps={{
                input: {
                    startAdornment: <span className={"text-[var(--text-light)] mr-1 " + (isMobile ? "text-xs" : "text-sm")}>
                        <SearchIcon fontSize="inherit" color={"inherit"}/></span>,
                }
            }}
            sx={{
                backgroundColor: 'var(--background-dark)', // bg-[var(--background-dark)]
                borderRadius: '0.5rem',                     // rounded-lg
                width: isMobile ? '135px' : '150px',                             // w-[132px]
                outline: 'none',                            // outline-none
                px: 0,                                      // removes padding from the wrapper
                '& .MuiOutlinedInput-root': {
                    padding: 0,                               // removes root padding
                    paddingLeft: "8px",
                    paddingRight: "8px",
                    '& input': {
                        padding: 0,                              // removes input text padding
                        fontSize: isMobile ? "12px" : "14px"
                    },
                    '& fieldset': { border: 'none' },         // removes outline
                    '&:hover fieldset': { border: 'none' },
                    '&.Mui-focused fieldset': { border: 'none' }
                },
            }}
            placeholder={"buscar categoría..."}
        />
        {filteredCategories && filteredCategories.slice(0, maxCount).map((c, index) => {
            return <button
                key={index}
                className={"rounded-lg px-2 " + (categories.includes(c) ? "bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-[var(--button-text)]" : "text-[var(--text-light)] hover:text-[var(--text)] hover:bg-[var(--background-dark2)] bg-[var(--background-dark)]")}
                onClick={() => {onClick(c)}}
            >
                {c}
            </button>
        })}
        {filteredCategories && maxCount < filteredCategories.length && <div className={"text-[var(--text-light)]"}>
            <button onClick={() => {setMaxCount(maxCount + 10)}} className={"rounded-full hover:bg-[var(--background-dark2)] bg-[var(--background-dark)] px-2"}>
                Ver más
            </button>
        </div>}
    </div>
}