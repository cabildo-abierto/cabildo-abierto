import {Plotter} from "@/components/visualizations/editor/plotter/plotter";


export const DatasetSize = ({plotter}: {
    plotter?: Plotter
}) => {

    return <div className={"text-[var(--text-light)] space-x-1 flex items-center"}>
        <div className={"font-semibold"}>{!plotter ? "..." : plotter.rows()}</div>
        <div>filas x</div>
        <div className={"font-semibold"}>{plotter.columns.length}</div>
        <div>columnas</div>
    </div>
}