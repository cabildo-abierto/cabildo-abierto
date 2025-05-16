import {PlotConfigProps} from "@/lib/types";
import {Main as Visualization} from "@/lex-api/types/ar/cabildoabierto/embed/visualization"


function configToVisualizationSpec(config: PlotConfigProps): Visualization["spec"] {
    if(config.kind == "Histograma"){
        return {
            $type: "ar.cabildoabierto.embed.visualization#histogram",
            normalized: "",
            xlabel: config.columna,
            ylabel: ""
        }
    } else if(config.kind == "Gráfico de línea"){
        return {
            $type: "ar.cabildoabierto.embed.visualization#barplot",
            normalized: ""
        }
    }
}


export function kindToLexicon(kind: string): string {
    const dict = {
        "Histograma": "histogram",
        "Gráfico de línea": "lines",
        "Gráfico de barras": "barplot",
        "Gráfico de puntos": "scatterplot",
        "Hemiciclo": "#hemicycleVisualization"
    }

    return dict[kind];
}


export function lexiconToKind(lexicon: string): string {
    const dict = {
        "histogram": "Histograma",
        "lines": "Gráfico de línea",
        "barplot": "Gráfico de barras",
        "scatterplot": "Gráfico de puntos",
        "#hemicycleVisualization": "Hemiciclo"
    }
    return dict[lexicon];
}