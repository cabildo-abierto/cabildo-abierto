"use client"

import React, {ReactNode, useState} from "react";
import {CustomLink as Link} from '../layout/utils/custom-link';
import SelectionComponent from "@/components/buscar/search-selection-component";
import {
    AlgorithmConfig,
    EnDiscusionMetric,
    EnDiscusionTime, FeedFormatOption,
} from "@/lib/types"
import {useSession} from "@/queries/getters/useSession";
import {post} from "@/utils/fetch";
import {useQueryClient} from "@tanstack/react-query";
import InfoPanel from "../layout/utils/info-panel";
import {topicUrl} from "@/utils/uri";
import {
    defaultEnDiscusionFormat,
    defaultEnDiscusionMetric,
    defaultEnDiscusionTime,
    defaultTopicMentionsFormat,
    defaultTopicMentionsMetric,
    defaultTopicMentionsTime
} from "@/components/config/defaults";
import {configOptionNodes} from "@/components/config/config-option-nodes";
import {Note} from "../layout/utils/note";


function followingConfigToSelected(c: AlgorithmConfig["following"]) {
    if (!c) return "Cabildo Abierto"
    else if (c.format == "Artículos") return "Artículos"
    else if (c.filter == "Todos") return "Todos"
    else return "Cabildo Abierto"
}


const ConfigPanel = ({
                         title,
                         moreInfoHref,
                         infoText,
                         content
                     }: {
    title: string
    moreInfoHref: string
    infoText: string
    content: ReactNode
}) => {
    return <div className={"space-y-2"}>
        <div className={"text-[var(--text-light)] font-medium flex space-x-1 items-center"}>
            <div className={"uppercase"}>
                {title}
            </div>
            <div className={"pb-[2px]"}>
                <InfoPanel
                    iconFontSize={17}
                    moreInfoHref={moreInfoHref}
                    text={infoText}
                />
            </div>
        </div>
        {content}
    </div>
}


export const FeedDefaultsSettings = () => {
    const {user} = useSession()
    const [config, setConfig] = useState<AlgorithmConfig>(user.algorithmConfig)
    const qc = useQueryClient()

    async function onSave(config: AlgorithmConfig) {
        const {error} = await post<AlgorithmConfig, {}>("/algorithm-config/", config)
        if (!error) {
            qc.setQueryData(["session"], {
                ...user,
                algorithmConfig: config
            })
        }
        return {error}
    }

    const following = followingConfigToSelected(config.following)

    async function setFollowing(v: string) {
        let newConfig: AlgorithmConfig
        if (v == "Todos") {
            newConfig = {
                ...config,
                following: {
                    ...config.following,
                    filter: "Todos",
                    format: "Todos"
                }
            }
        } else if (v == "Artículos") {
            newConfig = {
                ...config,
                following: {
                    ...config.following,
                    filter: "Solo Cabildo Abierto",
                    format: "Artículos"
                }
            }
        } else if (v == "Cabildo Abierto") {
            newConfig = {
                ...config,
                following: {
                    ...config.following,
                    filter: "Solo Cabildo Abierto",
                    format: "Todos"
                }
            }
        }
        setConfig(newConfig)
        await onSave(newConfig)
    }


    async function setEnDiscusionMetric(v: EnDiscusionMetric) {
        const newConfig: AlgorithmConfig = {
            ...config,
            enDiscusion: {
                ...config.enDiscusion,
                metric: v
            }
        }
        setConfig(newConfig)
        await onSave(newConfig)
    }

    async function setTopicMentionsMetric(v: EnDiscusionMetric) {
        const newConfig: AlgorithmConfig = {
            ...config,
            topicMentions: {
                ...config.topicMentions,
                metric: v
            }
        }
        setConfig(newConfig)
        await onSave(newConfig)
    }


    async function setTopicMentionsTime(v: EnDiscusionTime) {
        const newConfig: AlgorithmConfig = {
            ...config,
            topicMentions: {
                ...config.topicMentions,
                time: v
            }
        }
        setConfig(newConfig)
        await onSave(newConfig)
    }


    async function setTopicMentionsFormat(v: FeedFormatOption) {
        const newConfig: AlgorithmConfig = {
            ...config,
            topicMentions: {
                ...config.topicMentions,
                format: v
            }
        }
        setConfig(newConfig)
        await onSave(newConfig)
    }


    async function setEnDiscusionTime(v: EnDiscusionTime) {
        const newConfig: AlgorithmConfig = {
            ...config,
            enDiscusion: {
                ...config.enDiscusion,
                time: v
            }
        }
        setConfig(newConfig)
        await onSave(newConfig)
    }


    async function setEnDiscusionFormat(v: FeedFormatOption) {
        const newConfig: AlgorithmConfig = {
            ...config,
            enDiscusion: {
                ...config.enDiscusion,
                format: v
            }
        }
        setConfig(newConfig)
        await onSave(newConfig)
    }


    async function setTTTime(v: EnDiscusionTime) {
        const newConfig: AlgorithmConfig = {
            ...config,
            tt: {
                ...config.tt,
                time: v
            }
        }
        setConfig(newConfig)
        await onSave(newConfig)
    }


    return <div className={"space-y-8 mb-16 mt-4"}>
        <ConfigPanel
            title={"Siguiendo"}
            moreInfoHref={topicUrl("Cabildo Abierto: Muros", undefined, "normal")}
            infoText={"Configuración por defecto del muro Siguiendo."}
            content={<SelectionComponent
                onSelection={setFollowing}
                options={["Todos", "Cabildo Abierto", "Artículos"]}
                optionsNodes={configOptionNodes}
                selected={following}
                className={"flex gap-x-2 gap-y-1 flex-wrap"}
                optionContainerClassName={""}
            />}
        />
        <ConfigPanel
            title={"En discusión"}
            moreInfoHref={topicUrl("Cabildo Abierto: Muros", undefined, "normal")}
            infoText={"Configuración por defecto del muro Siguiendo."}
            content={<div className={"space-y-4"}>
                <div>
                    <div className={"text-xs text-[var(--text-light)]"}>
                        Métrica
                    </div>
                    <SelectionComponent
                        onSelection={setEnDiscusionMetric}
                        options={["Popularidad relativa", "Me gustas", "Interacciones", "Recientes"]}
                        optionsNodes={configOptionNodes}
                        selected={config.enDiscusion?.metric ?? defaultEnDiscusionMetric}
                        className={"flex gap-x-2 gap-y-1 flex-wrap"}
                        optionContainerClassName={""}
                    />
                </div>
                <div>
                    <div className={"text-xs text-[var(--text-light)]"}>
                        Período
                    </div>
                    <SelectionComponent<EnDiscusionTime>
                        onSelection={setEnDiscusionTime}
                        options={["Último día", "Última semana", "Último mes"]}
                        optionsNodes={configOptionNodes}
                        selected={config.enDiscusion?.time ?? defaultEnDiscusionTime}
                        className={"flex gap-x-2 gap-y-1 flex-wrap"}
                        optionContainerClassName={""}
                    />
                </div>
                <div>
                    <div className={"text-xs text-[var(--text-light)]"}>
                        Formato
                    </div>
                    <SelectionComponent
                        onSelection={setEnDiscusionFormat}
                        options={["Todos", "Artículos"]}
                        optionsNodes={configOptionNodes}
                        selected={config.enDiscusion?.format ?? defaultEnDiscusionFormat}
                        className={"flex gap-x-2 gap-y-1 flex-wrap"}
                        optionContainerClassName={""}
                    />
                </div>
            </div>}
        />
        <ConfigPanel
            title={"Temas en tendencia"}
            moreInfoHref={topicUrl("Cabildo Abierto: Popularidad de temas", undefined, "normal")}
            infoText={"El período por defecto de los temas en la sección Temas y en el panel lateral (en PC)."}
            content={<SelectionComponent
                onSelection={setTTTime}
                options={["Último mes", "Última semana", "Último día"]}
                optionsNodes={configOptionNodes}
                selected={config.tt?.time ?? "Última semana"}
                className={"flex gap-x-2 gap-y-1 flex-wrap"}
                optionContainerClassName={""}
            />}
        />
        <ConfigPanel
            title={"Muros de temas"}
            moreInfoHref={topicUrl("Cabildo Abierto: Muros", undefined, "normal")}
            infoText={"Configuración por defecto del muro de menciones de cada tema."}
            content={<div className={"space-y-4"}>
                <div>
                    <div className={"text-xs text-[var(--text-light)]"}>
                        Métrica
                    </div>
                    <SelectionComponent
                        onSelection={setTopicMentionsMetric}
                        options={["Popularidad relativa", "Me gustas", "Interacciones", "Recientes"]}
                        optionsNodes={configOptionNodes}
                        selected={config.topicMentions?.metric ?? defaultTopicMentionsMetric}
                        className={"flex gap-x-2 gap-y-1 flex-wrap"}
                        optionContainerClassName={""}
                    />
                </div>
                <div>
                    <div className={"text-xs text-[var(--text-light)]"}>
                        Período
                    </div>
                    <SelectionComponent<EnDiscusionTime>
                        onSelection={setTopicMentionsTime}
                        options={["Último día", "Última semana", "Último mes"]}
                        optionsNodes={configOptionNodes}
                        selected={config.topicMentions?.time ?? defaultTopicMentionsTime}
                        className={"flex gap-x-2 gap-y-1 flex-wrap"}
                        optionContainerClassName={""}
                    />
                </div>
                <div>
                    <div className={"text-xs text-[var(--text-light)]"}>
                        Formato
                    </div>
                    <SelectionComponent
                        onSelection={setTopicMentionsFormat}
                        options={["Todos", "Artículos"]}
                        optionsNodes={configOptionNodes}
                        selected={config.topicMentions?.format ?? defaultTopicMentionsFormat}
                        className={"flex gap-x-2 gap-y-1 flex-wrap"}
                        optionContainerClassName={""}
                    />
                </div>
            </div>}
        />
        <Note>
            Todas las configuraciones también se pueden cambiar temporalmente al estar viendo el contenido. Si querés
            una configuración que no ves acá, <Link
            href={topicUrl("Cabildo Abierto: Solicitudes de usuarios", undefined, "normal")}>sugerila</Link>.
        </Note>
    </div>
}
