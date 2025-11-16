import {useCategories} from "@/queries/getters/useTopics";
import {emptyChar} from "../../utils/utils";
import React, {useEffect, useMemo, useState} from "react";
import {ErrorPage} from "../../utils/error-page";
import {useLayoutConfig} from "../../layout/main-layout/layout-config-context";
import {cleanText} from "@cabildo-abierto/utils/dist/strings";
import {SearchBar} from "@/components/utils/base/search-bar";
import {DescriptionOnHover} from "@/components/utils/base/description-on-hover";
import {BaseIconButton} from "@/components/utils/base/base-icon-button";
import {StackIcon} from "@phosphor-icons/react";
import {cn} from "@/lib/utils";


export const CategorySelector = ({categories, setMultipleEnabled, setCategories, multipleEnabled}: {
    categories: string[]
    setCategories: (c: string[]) => void
    multipleEnabled: boolean
    setMultipleEnabled: (enabled: boolean) => void
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

    return <div
        id="category-selector"
        className={"flex flex-wrap items-center gap-x-2 gap-y-1 min-[500px]:text-sm text-[11px]"}
    >
        <SearchBar
            className={"w-[144px]"}
            inputClassName={"py-[0px] text-[12px]"}
            inputGroupClassName={""}
            autoComplete={"off"}
            searchValue={categorySearch}
            setSearchValue={(e) => {
                setCategorySearch(e)
            }}
            placeholder={"Buscar categoría..."}
        />
        <DescriptionOnHover
            description={!multipleEnabled && "Activalo para buscar temas que estén en múltiples categorías a la vez."}
        >
            <BaseIconButton
                size="small"
                className={multipleEnabled && "bg-[var(--background-dark)]"}
                onClick={() => {
                    setMultipleEnabled(!multipleEnabled)
                }}
            >
                <StackIcon/>
            </BaseIconButton>
        </DescriptionOnHover>
        {filteredCategories && filteredCategories.length == 0 && <div
            className={"text-[var(--text-light)] text-sm"}
        >
            No se encontaron categorías...
        </div>}
        {filteredCategories && filteredCategories.slice(0, maxCount).map((c, index) => {
            return <button
                key={index}
                className={cn("px-1", (categories.includes(c) ? "bg-[var(--background-dark2)] hover:bg-[var(--background-dark3)]" : "text-[var(--text-light)] hover:text-[var(--text)] hover:bg-[var(--background-dark)]"))}
                onClick={() => {
                    onClick(c)
                }}
            >
                {c}
            </button>
        })}
        {filteredCategories && maxCount < filteredCategories.length && <div className={"text-[var(--text-light)]"}>
            <button
                onClick={() => {
                    setMaxCount(maxCount + 10)
                }}
                className={"underline hover:bg-[var(--background-dark)] px-1 text-[var(--text-light)]"}
            >
                Ver más
            </button>
        </div>}
    </div>
}