"use client"
import {FilterProps, PlotConfigProps} from "../../app/lib/definitions";
import {VisualizationSpec} from "react-vega";

function getMark(config: PlotConfigProps): any {
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


function getEncoding(config: PlotConfigProps): any {
    if(config.kind == "Gráfico de barras") {
        return {
            x: {
                field: config["Eje x"],
                type: "ordinal",
                axis: {title: config["Eje x"], labelAngle: 0, grid: false},
            },
            y: {
                field: config["Eje y"],
                type: "quantitative",
                aggregate: "average",
                axis: {title: config["Eje y"], grid: true, gridOpacity: 0.2},
            },
            color: {value: "#6ca0e4"},
            tooltip: [
                {
                    field: config["Eje x"],
                    type: "ordinal",
                    title: config["Eje x"]},
                {
                    field: config["Eje y"],
                    type: "quantitative",
                    title: `Media de ${config["Eje y"]}`,
                    aggregate: "average"
                },
            ],
        }
    } else if(config.kind == "Gráfico de línea") {
        return {
            x: {
                field: config["Eje x"],
                type: "temporal",
                axis: {title: config["Eje x"], labelAngle: 0, grid: false},
            },
            y: {
                field: config["Eje y"],
                type: "quantitative",
                axis: {title: config["Eje y"], grid: true, gridOpacity: 0.2},
            },
            color: {value: "#6ca0e4"}, // Line color
            tooltip: [
                {field: config["Eje x"], type: "quantitative", title: config["Eje x"]},
                {field: config["Eje y"], type: "quantitative", title: config["Eje y"]},
            ],
        }
    } else if(config.kind == "Histograma"){
        const column = config["Columna"]
        return {
            x: {
                field: column,
                type: "quantitative",
                bin: { maxbins: 20 },
                axis: { title: column, labelAngle: 0, grid: false },
            },
            y: {
                aggregate: "count",
                type: "quantitative",
                axis: { title: "Cantidad", grid: true, gridOpacity: 0.2 },
            },
            color: { value: "#6ca0e4" },
            tooltip: [
                { field: column, type: "quantitative", title: column },
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


function getSelection(config: PlotConfigProps): any {
    return {
        grid: {
            type: "interval", // Enables zooming and panning
            bind: "scales", // Synchronizes the zoom with axis scales
            encodings: ["x"], // Restrict to the x-axis
        },
    }
}


function getStrokeWidth(config: PlotConfigProps): any {
    if(config.kind == "Gráfico de línea"){
        return 2
    } else {
        return 1
    }
}


export function getSpecForConfig(config: PlotConfigProps, data?: any): any {
    function isValid(f: FilterProps){
        return f.value != undefined && ["igual a", "distinto de"].includes(f.op) && config.dataset.dataset.columns.includes(f.column)
    }

    const validFilters = config.filters ? config.filters.filter((f) => (isValid(f))) : []

    const transform = validFilters.map((f) => {
        const op = f.op == "igual a" ? "===" : "!==="
        let value: string = f.value
        if(!value.startsWith('"')) value = '"' + value
        if(!value.endsWith('"')) value = value + '"'
        return {
            "filter": "datum." + f.column + " " + op + " " + value
        }
    })

    let dataSpec: {
        values: string
    } | {url: string, type: string}
    if(data != null){
        dataSpec = {
            values: data
        }
    } else {
        dataSpec = {
            url: "/dataset/" + config.dataset.author.did + "/" + config.dataset.rkey,
            type: "json"
        }
    }

    const spec: VisualizationSpec = {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        width: 450,
        title: {
            text: config["Título"],
            fontSize: 24,
            font: "Helvetica",
            color: "#fbfbfc",
        },
        data: dataSpec,
        transform: transform,
        mark: getMark(config),
        encoding: getEncoding(config),
        params: [
            {
                name: "grid",
                select: {
                    type: "interval",
                    encodings: ["x"]
                },
                bind: "scales"
            }
        ],
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
    }

    return spec
}