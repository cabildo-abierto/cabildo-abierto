import { AxesPlotter } from "../axes-plotter";
import {ArCabildoabiertoEmbedVisualization} from "@cabildo-abierto/api"
import {OneAxisPlotter} from "../one-axis/one-axis-plotter";
import {TwoAxisPlotter} from "./two-axis-plotter";
import {DatasetForTableView} from "@/components/visualizations/visualization/table/types";

export function createAxesPlotter(
    spec: ArCabildoabiertoEmbedVisualization.Main["spec"],
    dataset: DatasetForTableView,
    filters?: ArCabildoabiertoEmbedVisualization.Main["filters"]
): AxesPlotter {
    if (ArCabildoabiertoEmbedVisualization.isOneAxisPlot(spec)) {
        return new OneAxisPlotter(spec, dataset, filters)
    } else if (ArCabildoabiertoEmbedVisualization.isTwoAxisPlot(spec)) {
        return new TwoAxisPlotter(spec, dataset, filters)
    } else {
        throw new Error("Sin implementar!");
    }
}