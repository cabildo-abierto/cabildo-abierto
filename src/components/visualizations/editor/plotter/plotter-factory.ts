import { AxesPlotter } from "./axes-plotter";
import {DatasetForTableView} from "@/components/datasets/dataset-table-view";
import {
    isOneAxisPlot,
    isTwoAxisPlot,
    Main as Visualization
} from "@/lex-api/types/ar/cabildoabierto/embed/visualization";
import {OneAxisPlotter} from "@/components/visualizations/editor/plotter/one-axis-plotter";
import {TwoAxisPlotter} from "@/components/visualizations/editor/plotter/two-axis-plotter";

export function createAxesPlotter(
    spec: Visualization["spec"],
    dataset: DatasetForTableView,
    filters?: Visualization["filters"]
): AxesPlotter {
    if (isOneAxisPlot(spec)) {
        return new OneAxisPlotter(spec, dataset, filters)
    } else if (isTwoAxisPlot(spec)) {
        return new TwoAxisPlotter(spec, dataset, filters)
    } else {
        throw new Error("Sin implementar!");
    }
}