"use client"
import {DatasetProps, FilterProps, PlotConfigProps} from "@/lib/definitions";
import {TopLevelParameter} from "vega-lite/src/spec/toplevel";
import {AnyMark} from "vega-lite/src/mark";
import {FacetedCompositeEncoding} from "vega-lite/src/compositemark";
import {Sort} from "vega-lite/src/sort";
import {StringFieldDef, StringFieldDefWithCondition, StringValueDefWithCondition} from "vega-lite/src/channeldef";
import {VisualizationSpec} from "vega-embed";
import {getDidFromUri, getRkeyFromUri} from "../../../utils/uri";

const textColor = "#fbfbfc"
const primaryColor = "#6ca0e4"

function getMark(config: PlotConfigProps): AnyMark {
    if(config.kind == "Gráfico de barras") {
        return {
            type: "bar",
            tooltip: true,
        }
    } else if(config.kind == "Gráfico de línea") {
        return {
            type: "line",
            tooltip: true
        }
    } else if(config.kind == "Histograma"){
        return {
            type: "bar",
            tooltip: {
                content: "encoding",
            }
        }
    } else {
        throw Error("Not implemented")
    }
}


function getColorForConfig(config: PlotConfigProps) {

    if(config.kind == "Gráfico de barras" || config.kind == "Histograma"){
        return {value: primaryColor}
    }

    if(config["Color"] && config["Color"] != "Fijo"){
        return {
            "field": config["Color"],
            "type": "nominal",
            "legend": {
                "title": config["Color"],
                "labelColor": textColor,
                "titleColor": textColor
            }
        }
    } else {
        return {value: primaryColor}
    }
}


function getOpacity(config: PlotConfigProps) {
    if(config.kind == "Gráfico de línea" && config["Color"] && config["Color"] != "Fijo"){
        return {
            condition: [
                {param: "legend", "value": 1},
                {param: "hover", "value": 1, "empty": false}
            ],
            value: 0.2
        }
    } else {
        return undefined
    }
}


function getTooltipForConfig(config: PlotConfigProps): StringFieldDefWithCondition<any> | StringValueDefWithCondition<any> | StringFieldDef<any>[] {
    if(config.kind == "Gráfico de línea" && config["Color"] && config["Color"] != "Fijo"){
        return [
            {field: config["Eje x"], type: "temporal", title: config["Eje x"]},
            {field: config["Eje y"], type: "quantitative", title: config["Eje y"]},
            {
                "field": config["Color"],
                "type": "nominal",
                "title": config["Color"]
            }
        ]
    }
    return [
        {field: config["Eje x"], type: "temporal", title: config["Eje x"]},
        {field: config["Eje y"], type: "quantitative", title: config["Eje y"]},
    ]
}


function getEncoding(config: PlotConfigProps): FacetedCompositeEncoding<any> {
    if(config.kind == "Gráfico de barras" && (config["Orientación"] == "Vertical" || !config["Orientación"])) {
        return {
            x: {
                field: config["Eje x"],
                type: "ordinal",
                axis: {title: config["Etiqueta eje x"], labelAngle: 0, grid: false},
                sort: (config["Ordenar barras"] == "Sí" ? "-y" : false) as Sort<any>,
            },
            y: {
                field: config["Eje y"],
                type: "quantitative",
                aggregate: "average",
                axis: {title: config["Etiqueta eje y"], grid: true, gridOpacity: 0.2},
            },
            color: getColorForConfig(config),
            tooltip: [
                {
                    field: config["Eje x"],
                    type: "ordinal",
                    title: config["Eje x"]
                },
                {
                    field: config["Eje y"],
                    type: "quantitative",
                    title: config["Etiqueta eje y"],
                    aggregate: "average"
                },
            ],
        }
    } else if(config.kind == "Gráfico de barras" && config["Orientación"] == "Horizontal"){
        return {
            x: {
                field: config["Eje x"],
                type: "quantitative",
                aggregate: "average",
                axis: {title: config["Etiqueta eje x"], labelAngle: 0, grid: false},
            },
            y: {
                field: config["Eje y"],
                type: "ordinal",
                sort: (config["Ordenar barras"] == "Sí" ? "-x" : false) as Sort<any>,
                axis: {title: config["Etiqueta eje y"], grid: true, gridOpacity: 0.2},
            },
            color: getColorForConfig(config),
            tooltip: [
                {
                    field: config["Eje x"],
                    type: "quantitative",
                    title: config["Etiqueta eje x"],
                    aggregate: "average"
                },
                {
                    field: config["Eje y"],
                    type: "ordinal",
                    title: config["Etiqueta eje y"],
                },
            ],
        }
    } else if(config.kind == "Gráfico de línea") {
        return {
            x: {
                field: config["Eje x"],
                type: "temporal",
                axis: {
                    title: config["Etiqueta eje x"],
                    labelAngle: 0,
                    grid: false
                },
            },
            y: {
                field: config["Eje y"],
                type: "quantitative",
                aggregate: "average",
                axis: {
                    title: config["Etiqueta eje y"],
                    grid: true,
                    gridOpacity: 0.2
                },
            },
            color: getColorForConfig(config),
            tooltip: getTooltipForConfig(config),
            opacity: getOpacity(config),
        }
    } else if(config.kind == "Histograma"){
        const column = config["Columna"]
        return {
            x: {
                field: column,
                type: "quantitative",
                bin: { maxbins: 20 },
                axis: { title: config["Etiqueta columna"], labelAngle: 0, grid: false },
            },
            y: {
                aggregate: "count",
                type: "quantitative",
                axis: { title: "Cantidad", grid: true, gridOpacity: 0.2 },
            },
            color: { value: primaryColor },
            tooltip: [
                { field: column, type: "quantitative", title: config["Etiqueta columna"] },
                {
                    aggregate: "count", // Explicitly compute count
                    type: "quantitative",
                    title: "Cantidad",
                },
            ],
        }
    } else {
        throw Error("Not implemented")
    }
}


function getStrokeWidth(config: PlotConfigProps) {
    if(config.kind == "Gráfico de línea"){
        return 2
    } else {
        return 1
    }
}


function getParams(config: PlotConfigProps) {
    const hoverColor: TopLevelParameter = {
        name: "hover",
        select: {
            type: "point",
            fields: [config["Color"]],
            on: "mouseover",
            clear: "mouseout",
        }
    }

    const selectLegendColor: TopLevelParameter = {
        name: "legend",
        select: {"type": "point", "fields": [config["Color"]]},
        bind: "legend"
    }

    const zoom: TopLevelParameter = {
        name: "grid",
        select: {
            type: "interval",
            encodings: ["x"]
        },
        bind: "scales"
    }

    if(config.kind == "Gráfico de línea" && config["Color"] && config["Color"] != "Fijo"){
        return [zoom, selectLegendColor, hoverColor]
    }
    return [zoom]
}


export type PlotSpecMetadata = {
    editorConfig: PlotConfigProps,
    editor: string,
    editorVersion: string
}

export type VisualizationSpecWithMetadata = VisualizationSpec & {metadata: PlotSpecMetadata}

export function getSpecForConfig(config: PlotConfigProps, dataset: {dataset?: DatasetProps, data?: any}, dataInSpec: boolean = false) {
    function isValid(f: FilterProps){
        return f.value != undefined && ["igual a", "distinto de", "uno de"].includes(f.op) && dataset.dataset.dataset.columns.includes(f.column)
    }

    const validFilters = config.filters ? config.filters.filter((f) => (isValid(f))) : []

    const transform = validFilters.map((f) => {
        let filterExpression: string;

        if (f.op === "igual a") {
            filterExpression = `datum.${f.column} === "${f.value}"`;
        } else if (f.op === "distinto de") {
            filterExpression = `datum.${f.column} !== "${f.value}"`;
        } else if (f.op === "uno de") {
            try {
                const valuesArray = JSON.parse(f.value);
                if (Array.isArray(valuesArray)) {
                    const valuesList = valuesArray.map(v => `"${v}"`).join(", ");
                    filterExpression = `indexof([${valuesList}], datum.${f.column}) !== -1`;
                } else {
                    return null;
                }
            } catch (error) {
                return null;
            }
        } else {
            return null;
        }

        return { filter: filterExpression };
    }).filter(Boolean);


    let dataSpec: {
        values: string
    } | {url: string, type: string}
    if(dataset.data != null && dataInSpec){
        dataSpec = {
            values: dataset.data
        }
    } else {
        dataSpec = {
            url: "https://www.cabildoabierto.com.ar/dataset/" + getDidFromUri(config.datasetUri) + "/" + getRkeyFromUri(config.datasetUri),
            type: "json"
        }
    }

    const metadata: PlotSpecMetadata = {
        editorConfig: config,
        editorVersion: "0.2",
        editor: "https://www.cabildoabierto.com.ar/datos/nueva-visualizacion"
    }

    const spec: VisualizationSpec & {metadata: PlotSpecMetadata} = {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        width: 450,
        title: {
            text: config["Título"],
            fontSize: 24,
            font: "Helvetica",
            color: textColor,
        },
        data: dataSpec,
        transform: transform,
        mark: getMark(config),
        encoding: getEncoding(config),
        params: getParams(config),
        config: {
            background: "#181b23",
            axis: {
                labelFont: "Arial",
                labelFontSize: 12,
                titleFont: "Arial",
                titleFontSize: 14,
                titleColor: "#fbfbfc",
                labelColor: "#fbfbfc",
            },
            bar: {
                strokeWidth: getStrokeWidth(config)
            },
        },
        metadata
    }

    return spec
}

export function getVisualizationTitle(v: { visualization: { spec: string } }) {
    const spec = JSON.parse(v.visualization.spec)
    return spec.title.text
}