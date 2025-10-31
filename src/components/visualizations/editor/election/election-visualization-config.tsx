import {PlotConfigProps} from "@/lib/types";
import {produce} from "immer";
import {ArCabildoabiertoEmbedVisualization} from "@/lex-api/index"
import BaseSelect from "@/components/layout/base/base-select";

type ElectionVisualizationConfigProps = {
    config: PlotConfigProps
    setConfig: (config: PlotConfigProps) => void
    columnOptions: string[]
}

export const ElectionVisualizationConfig = ({
                                                config,
                                                setConfig,
                                                columnOptions,
                                            }: ElectionVisualizationConfigProps) => {
    if (ArCabildoabiertoEmbedVisualization.isEleccion(config.spec)) {
        return <div className={"space-y-4"}>
            <BaseSelect
                contentClassName={"z-[1501]"}
                options={[
                    "Legislativa",
                    "Ejecutiva"
                ]}
                value={config.spec.tipoDeEleccion ?? ""}
                onChange={(v) => {
                    setConfig(produce(config, draft => {
                        if (ArCabildoabiertoEmbedVisualization.isEleccion(draft.spec)) {
                            draft.spec.tipoDeEleccion = v
                        }
                    }))
                }}
                label="Tipo de elección"
                itemClassName={"text-[14px]"}
            />
            <BaseSelect
                contentClassName={"z-[1501]"}
                options={[
                    "Nacional",
                    "Buenos Aires",
                    "Catamarca",
                    "Chaco",
                    "Chubut",
                    "Córdoba",
                    "Corrientes",
                    "Entre Ríos",
                    "Formosa",
                    "Jujuy",
                    "La Pampa",
                    "La Rioja",
                    "Mendoza",
                    "Misiones",
                    "Neuquén",
                    "Río Negro",
                    "Salta",
                    "San Juan",
                    "San Luis",
                    "Santa Cruz",
                    "Santa Fe",
                    "Santiago del Estero",
                    "Tierra del Fuego, Antártida e Islas del Atlántico Sur",
                    "Tucumán"
                ]}
                value={config.spec.region ?? ""}
                onChange={(v) => {
                    setConfig(produce(config, draft => {
                        if (ArCabildoabiertoEmbedVisualization.isEleccion(draft.spec)) {
                            draft.spec.region = v
                        }
                    }))
                }}
                label="Región"
                itemClassName={"text-[14px]"}
            />
            <BaseSelect
                contentClassName={"z-[1501]"}
                options={columnOptions}
                label={"Columna candidato"}
                value={config.spec.columnaNombreCandidato ?? ""}
                onChange={(v: string) => {
                    setConfig(produce(config, draft => {
                        if (ArCabildoabiertoEmbedVisualization.isEleccion(draft.spec)) {
                            draft.spec.columnaNombreCandidato = v
                        }
                    }))
                }}
            />
            <BaseSelect
                contentClassName={"z-[1501]"}
                options={columnOptions}
                label={"Columna alianza"}
                value={config.spec.columnaAlianza ?? ""}
                onChange={(v: string) => {
                    setConfig(produce(config, draft => {
                        if (ArCabildoabiertoEmbedVisualization.isEleccion(draft.spec)) {
                            draft.spec.columnaAlianza = v
                        }
                    }))
                }}
            />
            <BaseSelect
                contentClassName={"z-[1501]"}
                options={columnOptions}
                label={"Columna distrito del candidato"}
                value={config.spec.columnaDistritoCandidato ?? ""}
                onChange={(v: string) => {
                    setConfig(produce(config, draft => {
                        if (ArCabildoabiertoEmbedVisualization.isEleccion(draft.spec)) {
                            draft.spec.columnaDistritoCandidato = v
                        }
                    }))
                }}
            />
            <BaseSelect
                contentClassName={"z-[1501]"}
                options={columnOptions}
                label={"Columna cargo al que se postula"}
                value={config.spec.columnaCargo ?? ""}
                onChange={(v: string) => {
                    setConfig(produce(config, draft => {
                        if (ArCabildoabiertoEmbedVisualization.isEleccion(draft.spec)) {
                            draft.spec.columnaCargo = v
                        }
                    }))
                }}
            />
            <BaseSelect
                contentClassName={"z-[1501]"}
                options={columnOptions}
                label={"Columna subcargo (titular o suplente)"}
                value={config.spec.columnaSubcargo ?? ""}
                onChange={(v: string) => {
                    setConfig(produce(config, draft => {
                        if (ArCabildoabiertoEmbedVisualization.isEleccion(draft.spec)) {
                            draft.spec.columnaSubcargo = v
                        }
                    }))
                }}
            />
            <BaseSelect
                contentClassName={"z-[1501]"}
                options={columnOptions}
                label={"Columna posición en lista"}
                value={config.spec.columnaPosicion ?? ""}
                onChange={(v: string) => {
                    setConfig(produce(config, draft => {
                        if (ArCabildoabiertoEmbedVisualization.isEleccion(draft.spec)) {
                            draft.spec.columnaPosicion = v
                        }
                    }))
                }}
            />
            <BaseSelect
                contentClassName={"z-[1501]"}
                options={columnOptions}
                label={"Columna tema de la wiki candidato"}
                value={config.spec.columnaTopicIdCandidato ?? ""}
                onChange={(v: string) => {
                    setConfig(produce(config, draft => {
                        if (ArCabildoabiertoEmbedVisualization.isEleccion(draft.spec)) {
                            draft.spec.columnaTopicIdCandidato = v
                        }
                    }))
                }}
            />
            <BaseSelect
                contentClassName={"z-[1501]"}
                options={columnOptions}
                label={"Columna tema de la wiki alianza"}
                value={config.spec.columnaTopicIdAlianza ?? ""}
                onChange={(v: string) => {
                    setConfig(produce(config, draft => {
                        if (ArCabildoabiertoEmbedVisualization.isEleccion(draft.spec)) {
                            draft.spec.columnaTopicIdAlianza = v
                        }
                    }))
                }}
            />
            <BaseSelect
                contentClassName={"z-[1501]"}
                options={columnOptions}
                label={"Columna tema de la wiki distrito"}
                value={config.spec.columnaTopicIdDistrito ?? ""}
                onChange={(v: string) => {
                    setConfig(produce(config, draft => {
                        if (ArCabildoabiertoEmbedVisualization.isEleccion(draft.spec)) {
                            draft.spec.columnaTopicIdDistrito = v
                        }
                    }))
                }}
            />
        </div>
    }
    return null
}