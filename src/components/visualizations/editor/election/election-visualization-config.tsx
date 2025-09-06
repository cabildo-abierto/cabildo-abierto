import {PlotConfigProps} from "@/lib/types";
import SearchableDropdown from "../../../../../modules/ui-utils/src/searchable-dropdown";
import {produce} from "immer";
import {isEleccion} from "@/lex-api/types/ar/cabildoabierto/embed/visualization";
import {Select} from "../../../../../modules/ui-utils/src/select";

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
    if(isEleccion(config.spec)){
        return <div className={"space-y-4"}>
            <Select
                options={[
                    "Legislativa",
                    "Ejecutiva"
                ]}
                value={config.spec.tipoDeEleccion ?? ""}
                onChange={(v) => {
                    setConfig(produce(config, draft => {
                        if (isEleccion(draft.spec)) {
                            draft.spec.tipoDeEleccion = v
                        }
                    }))
                }}
                label="Tipo de elección"
                fontSize={"14px"}
                labelShrinkFontSize={"14px"}
            />
            <Select
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
                        if (isEleccion(draft.spec)) {
                            draft.spec.region = v
                        }
                    }))
                }}
                label="Región"
                fontSize={"14px"}
                labelShrinkFontSize={"14px"}
            />
            <SearchableDropdown
                options={columnOptions}
                label={"Columna candidato"}
                size={"small"}
                selected={config.spec.columnaNombreCandidato ?? ""}
                onChange={(v: string) => {
                    setConfig(produce(config, draft => {
                        if (isEleccion(draft.spec)) {
                            draft.spec.columnaNombreCandidato = v
                        }
                    }))
                }}
            />
            <SearchableDropdown
                options={columnOptions}
                label={"Columna alianza"}
                size={"small"}
                selected={config.spec.columnaAlianza ?? ""}
                onChange={(v: string) => {
                    setConfig(produce(config, draft => {
                        if (isEleccion(draft.spec)) {
                            draft.spec.columnaAlianza = v
                        }
                    }))
                }}
            />
            <SearchableDropdown
                options={columnOptions}
                label={"Columna distrito del candidato"}
                size={"small"}
                selected={config.spec.columnaDistritoCandidato ?? ""}
                onChange={(v: string) => {
                    setConfig(produce(config, draft => {
                        if (isEleccion(draft.spec)) {
                            draft.spec.columnaDistritoCandidato = v
                        }
                    }))
                }}
            />
            <SearchableDropdown
                options={columnOptions}
                label={"Columna cargo al que se postula"}
                size={"small"}
                selected={config.spec.columnaCargo ?? ""}
                onChange={(v: string) => {
                    setConfig(produce(config, draft => {
                        if (isEleccion(draft.spec)) {
                            draft.spec.columnaCargo = v
                        }
                    }))
                }}
            />
            <SearchableDropdown
                options={columnOptions}
                label={"Columna subcargo (titular o suplente)"}
                size={"small"}
                selected={config.spec.columnaSubcargo ?? ""}
                onChange={(v: string) => {
                    setConfig(produce(config, draft => {
                        if (isEleccion(draft.spec)) {
                            draft.spec.columnaSubcargo = v
                        }
                    }))
                }}
            />
            <SearchableDropdown
                options={columnOptions}
                label={"Columna posición en lista"}
                size={"small"}
                selected={config.spec.columnaPosicion ?? ""}
                onChange={(v: string) => {
                    setConfig(produce(config, draft => {
                        if (isEleccion(draft.spec)) {
                            draft.spec.columnaPosicion = v
                        }
                    }))
                }}
            />
            <SearchableDropdown
                options={columnOptions}
                label={"Columna tema de la wiki candidato"}
                size={"small"}
                selected={config.spec.columnaTopicIdCandidato ?? ""}
                onChange={(v: string) => {
                    setConfig(produce(config, draft => {
                        if (isEleccion(draft.spec)) {
                            draft.spec.columnaTopicIdCandidato = v
                        }
                    }))
                }}
            />
            <SearchableDropdown
                options={columnOptions}
                label={"Columna tema de la wiki alianza"}
                size={"small"}
                selected={config.spec.columnaTopicIdAlianza ?? ""}
                onChange={(v: string) => {
                    setConfig(produce(config, draft => {
                        if (isEleccion(draft.spec)) {
                            draft.spec.columnaTopicIdAlianza = v
                        }
                    }))
                }}
            />
            <SearchableDropdown
                options={columnOptions}
                label={"Columna tema de la wiki distrito"}
                size={"small"}
                selected={config.spec.columnaTopicIdDistrito ?? ""}
                onChange={(v: string) => {
                    setConfig(produce(config, draft => {
                        if (isEleccion(draft.spec)) {
                            draft.spec.columnaTopicIdDistrito = v
                        }
                    }))
                }}
            />
        </div>
    }
    return null
}