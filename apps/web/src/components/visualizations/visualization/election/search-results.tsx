import {ElectionElement, ElectionPlotter} from "./election-plotter";
import React, {useMemo} from "react";
import {useDebounce} from "@/components/utils/react/debounce";


export const SearchResults = ({
                                  searchValue,
                                  plotter,
    onSelect,
    setSearchValue
                              }: {
    searchValue: string
    plotter: ElectionPlotter
    onSelect: (c: ElectionElement) => void
    setSearchValue: (v: string) => void
}) => {
    const debouncedSearchValue = useDebounce(searchValue, 100)

    const searchResults = useMemo(() => {
        if (debouncedSearchValue) return plotter.getSearchResults(debouncedSearchValue)
        return null
    }, [debouncedSearchValue])

    return <div>
        {searchResults && searchResults.length == 0 &&
            <div className={"text-xs text-[var(--text-light)] pt-4 text-center"}>
                Sin resultados
            </div>}
        {searchResults != null && <div>
            {searchResults.length > 0 && <div
                className={"px-2 pb-2 pt-2 grid grid-cols-3 gap-3 overflow-y-auto custom-scrollbar"}
                onWheel={(e) => {e.stopPropagation()}}
            >
                {searchResults.slice(0, 10).map((r, i) => {
                    return <div
                        key={i}
                        onClick={() => {
                            onSelect(r)
                            setSearchValue("")
                        }}
                        className={"border-[var(--accent-dark)] border cursor-pointer hover:bg-[var(--background-dark)] p-1 text-xs font-extralight text-[var(--text-light)]"}
                    >
                        {r.type == "candidato" && <div>
                            <div className={"capitalize font-semibold"}>
                                {r.value.nombre.toLowerCase()}
                            </div>
                            <div className={"text-[11px]"}>
                                {r.value.cargo} por <span className={"capitalize"}>
                                    {r.value.alianza.distrito.nombre.toLowerCase()}
                                    </span>
                            </div>
                        </div>}
                        {r.type == "alianza" && <div className={""}>
                            <div className={"font-semibold capitalize"}>
                                {r.value.nombre.toLowerCase()}
                            </div>
                            <div className={"text-[11px]"}>
                                Alianza en <span className={"capitalize"}>
                                    {r.value.distrito.nombre}
                                </span>
                            </div>
                        </div>}
                        {r.type == "distrito" && <div className={""}>
                            <div className={"font-semibold capitalize"}>
                                {r.value.nombre.toLowerCase()}
                            </div>
                        </div>}
                    </div>
                })}
            </div>}
            {searchResults.length > 10 && <div className={"pl-2 text-xs font-extralight text-[var(--text-light)]"}>
                Se muestran los primeros 10 resultados.
            </div>}
        </div>}
    </div>
}