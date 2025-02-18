import {useDatasets, useVisualizations} from "../../hooks/contents";
import {useSearch} from "./search-context";
import LoadingSpinner from "../loading-spinner";
import {DatasetProps, VisualizationProps} from "../../app/lib/definitions";
import {cleanText} from "../utils";
import Feed from "../feed/feed";
import React from "react";


export const DataSearchResults = ({onSearchPage=false}: {onSearchPage?: boolean}) => {
    const {searchState} = useSearch()
    const datasets = useDatasets()
    const visualizations = useVisualizations()

    if(onSearchPage && searchState.value.length == 0) {
        return <div className={"mt-8 text-[var(--text-light)] text-center"}>
            Buscá un conjunto de datos o visualización
        </div>
    }


    if(datasets.isLoading || !datasets.datasets || visualizations.isLoading || !visualizations.visualizations){
        return <div className={"mt-8"}>
            <LoadingSpinner/>
        </div>
    }

    const searchValue = cleanText(searchState.value)

    let filteredDatasets = datasets.datasets.filter((c: DatasetProps) => {
        const text = cleanText(c.dataset.title)
        return text.includes(searchValue)
    })
    let filteredVisualizations = visualizations.visualizations.filter((c: VisualizationProps) => {
        const text = cleanText(c.visualization.dataset.dataset.title)
        return text.includes(searchValue)
    })

    let joined = [...filteredDatasets, ...filteredVisualizations]

    joined = joined.sort((a, b) => (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()))

    return <Feed feed={{feed: joined, isLoading: false, error: undefined}} noResultsText={"No se encontró ningún dataset o visualización"}/>
}