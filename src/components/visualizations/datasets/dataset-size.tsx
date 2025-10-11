import {ArCabildoabiertoDataDataset} from "@/lex-api"
import {useMemo} from "react";
import {Plotter} from "@/components/visualizations/editor/plotter/plotter";
import {type AnyDatasetView} from "@/components/visualizations/datasets/dataset-full-view";
import {DatasetEditState} from "@/components/visualizations/datasets/dataset-editor";


export const DatasetSize = ({dataset, showLoading=false}: {
    dataset: AnyDatasetView | DatasetEditState
    showLoading?: boolean
}) => {
    const plotter = useMemo(() => {
        if(ArCabildoabiertoDataDataset.isDatasetView(dataset) || ArCabildoabiertoDataDataset.isTopicsDatasetView(dataset)) {
            const plotter = new Plotter(undefined, dataset)
            plotter.prepareForPlot()
            return plotter
        } else if(dataset.$type == "editing") {
            if(dataset.data) {
                const plotter = new Plotter(undefined, {
                    data: dataset.data,
                    columns: dataset.columns
                })
                plotter.prepareForPlot()
                return plotter
            }
        } else {
            return null
        }
    }, [dataset])

    return (plotter || showLoading) && <div className={"text-[var(--text-light)] space-x-1 flex items-center"}>
        <div className={"font-semibold"}>{!plotter ? "..." : plotter.rows()}</div>
        <div>filas x</div>
        <div className={"font-semibold"}>{dataset.columns.length}</div>
        <div>columnas</div>
    </div>
}