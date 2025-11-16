import {ArCabildoabiertoEmbedVisualization, ArCabildoabiertoDataDataset} from "@cabildo-abierto/api"
import {$Typed} from "@atproto/api";


export function getDatasetVisualizationView(
    visualization: ArCabildoabiertoEmbedVisualization.Main,
    dataset: $Typed<ArCabildoabiertoDataDataset.DatasetView> | $Typed<ArCabildoabiertoDataDataset.TopicsDatasetView>): ArCabildoabiertoEmbedVisualization.View {
    return {
        visualization,
        dataset,
        $type: "ar.cabildoabierto.embed.visualization#view"
    }
}


export function visualizationViewToMain(v: ArCabildoabiertoEmbedVisualization.View): ArCabildoabiertoEmbedVisualization.Main {
    return v.visualization
}