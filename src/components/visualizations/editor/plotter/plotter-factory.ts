import { AxesPlotter } from "./axes-plotter";
import {DatasetForTableView} from "@/components/visualizations/datasets/dataset-table-view";
import {ArCabildoabiertoEmbedVisualization} from "@/lex-api/index"
import {OneAxisPlotter} from "@/components/visualizations/editor/plotter/one-axis-plotter";
import {TwoAxisPlotter} from "@/components/visualizations/editor/plotter/two-axis-plotter";

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