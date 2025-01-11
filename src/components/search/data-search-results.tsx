import {useDatasets, useVisualizations} from "../../hooks/contents";
import {useSearch} from "../search-context";
import LoadingSpinner from "../loading-spinner";
import {DatasetProps, VisualizationProps} from "../../app/lib/definitions";
import {cleanText} from "../utils";
import Feed from "../feed/feed";


export const DataSearchResults = () => {
    const {searchState} = useSearch()
    const datasets = useDatasets()
    const visualizations = useVisualizations()

    if(datasets.isLoading || !datasets.datasets || visualizations.isLoading || !visualizations.visualizations){
        return <LoadingSpinner/>
    }

    const searchValue = cleanText(searchState.value)

    if(searchValue.length == 0){
        return null
    }

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

    return <Feed feed={{feed: joined, isLoading: false, isError: false}}/>
}