"use client"

import React, {useState} from "react";
import {CustomLink as Link} from '../../../../modules/ui-utils/src/custom-link';
import {PermissionLevel} from "@/components/topics/topic/permission-level";
import {CloseSessionButton, logout} from "@/components/auth/close-session-button";
import SelectionComponent from "@/components/buscar/search-selection-component";
import {ThemeMode, useTheme} from "@/components/theme/theme-context";
import LoadingSpinner from "../../../../modules/ui-utils/src/loading-spinner";
import {Button} from "../../../../modules/ui-utils/src/button";
import {
    Account, AlgorithmConfig,
    EnDiscusionMetric,
    EnDiscusionTime, FeedFormatOption,
} from "@/lib/types"
import {useAPI} from "@/queries/utils";
import {useCurrentValidationRequest} from "@/queries/useValidation";
import {useSession} from "@/queries/useSession";
import {post} from "@/utils/fetch";
import {useQueryClient} from "@tanstack/react-query";
import InfoPanel from "../../../../modules/ui-utils/src/info-panel";
import {topicUrl} from "@/utils/uri";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {BaseFullscreenPopup} from "../../../../modules/ui-utils/src/base-fullscreen-popup";
import {TextField} from "@mui/material";
import StateButton from "../../../../modules/ui-utils/src/state-button";
import {useRouter} from "next/navigation";
import {
    defaultEnDiscusionFormat,
    defaultEnDiscusionMetric,
    defaultEnDiscusionTime,
    defaultTopicMentionsFormat,
    defaultTopicMentionsMetric,
    defaultTopicMentionsTime
} from "@/components/config/defaults";
import {feedOptionNodes} from "@/components/config/feed-option-nodes";


const useAccount = () => {
    const res = useAPI<Account>("/account", ["account"])
    return {...res, account: res.data}
}


const DeleteAccountButton = () => {
    const [deletingAccount, setDeletingAccount] = useState<boolean>(false)
    const [text, setText] = useState("")
    const qc = useQueryClient()
    const router = useRouter()

    async function onClick() {
        const {error} = await post<{}, {}>("/delete-ca-profile", {})
        if(error) return {error}
        return await logout(qc, router)
    }

    return <div>
        <Button
            color={"background-dark2"}
            startIcon={<DeleteOutlineIcon/>}
            onClick={() => {setDeletingAccount(true)}}
            borderColor={"text-lighter"}
        >
            Borrar cuenta
        </Button>
        {deletingAccount && <BaseFullscreenPopup open={deletingAccount} onClose={() => {setDeletingAccount(false)}} closeButton={true}>
            <div className={"pb-4 flex flex-col items-center w-[400px] text-[var(--text-light)] px-8 space-y-4"}>
                <h2>
                    Borrar cuenta
                </h2>
                <div className={"text-sm space-y-2"}>
                    <p>
                        Tu cuenta va a dejar de ser parte de Cabildo Abierto pero no se va a borrar ningún contenido de tu repositorio personal de datos.
                    </p>
                    <p>
                        Esta decisión es reversible. Si querés borrar definitivamente todos tus datos escribinos a soporte@cabildoabierto.ar.
                    </p>
                    <p>
                        {'Escribí "borrarcuenta" para confirmar.'}
                    </p>
                </div>
                <div className={"w-full"}>
                    <TextField
                        fullWidth
                        size={"small"}
                        value={text}
                        onChange={(e) => {setText(e.target.value)}}
                    />
                </div>
                <div className={"flex justify-end w-full"}>
                    <StateButton
                        color={"red-dark"}
                        handleClick={onClick}
                        disabled={text != "borrarcuenta"}
                        text1={"Confirmar"}
                    />
                </div>
            </div>
        </BaseFullscreenPopup>}
    </div>
}


const AccountSettings = () => {
    const {user} = useSession()
    const {account, isLoading} = useAccount()
    const {data: request, isLoading: requestLoading} = useCurrentValidationRequest()

    if (isLoading || requestLoading) {
        return <div className={"py-8"}>
            <LoadingSpinner/>
        </div>
    }

    return <>
        <div className="mb-4">
            <div className="text-[var(--text-light)] font-medium text-sm">Nombre de usuario</div>
            <div className="text-lg ">@{user.handle}</div>
        </div>
        <div className="mb-4">
            <div className="text-[var(--text-light)] font-medium text-sm">Nombre visible</div>
            <div className="text-lg ">{user.displayName ? user.displayName : "Sin definir."}</div>
        </div>
        <div className="mb-4">
            <div className="text-[var(--text-light)] font-medium text-sm">Contraseña</div>
            <Link
                className="text-[var(--primary)] hover:underline"
                target="_blank"
                href={"https://bsky.app/settings/account"}
            >
                Cambiar desde Bluesky.
            </Link>
        </div>
        <div className="mb-4">
            <div className="text-[var(--text-light)] font-medium text-sm">Mail</div>
            {account.email ? <div className="text-lg ">{account.email}</div> :
                <div className="text-lg ">Pendiente</div>}
            <Link
                className="text-[var(--primary)] hover:underline"
                target="_blank"
                href={"https://bsky.app/settings/account"}
            >
                {account.email ? "Cambiar" : "Agregar"} desde Bluesky.
            </Link>
        </div>
        <div className="mb-4">
            <div className="text-[var(--text-light)] font-medium text-sm">Permisos de edición en la wiki</div>
            <div className="text-lg">
                <PermissionLevel level={user.editorStatus} className={""}/>
            </div>
        </div>
        <div className="mb-4">
            <div className="text-[var(--text-light)] font-medium text-sm">Verificación de la cuenta</div>
            <div className="text-lg">
                {!request || request.result != "Aceptada" ? "Sin verificar." : (request.type == "persona" ? "Cuenta de persona verificada." : "Cuenta de organización verificada.")}
            </div>
        </div>
        {(!request.result || request.result != "Aceptada") &&
            <Button size={"small"} href={"/ajustes/solicitar-validacion"}>
                <span className={"font-semibold text-sm py-1"}>Verificar cuenta</span>
            </Button>}
        <div className={"mt-4 flex justify-start"}>
            <CloseSessionButton/>
        </div>
        <div className={"mt-4 flex justify-start"}>
            <DeleteAccountButton/>
        </div>
    </>
}


const AppearanceSettings = () => {
    const {mode, setMode} = useTheme();

    function onSelection(v: ThemeMode) {
        setMode(v)
    }

    function optionsNodes(o: ThemeMode, selected: boolean) {
        let className = "border text-base rounded-lg px-2 cursor-pointer " + (selected ? "border-2 border-[var(--text)]" : "")

        if (o == "light") {
            className += " bg-[#FFFFF0] text-[#1a1a1a]"
        } else if (o == "dark") {
            className += " bg-[#191923] text-[#eeeeee]"
        } else if (o == "system") {
            className += " bg-[var(--background-dark)]"
        }

        return <button
            className={className}
        >
            {o == "system" ? "Sistema" : o == "light" ? "Claro" : "Oscuro"}
        </button>
    }

    return <>
        <div className="mb-4 space-y-4">
            <div className={"text-lg text-[var(--text-light)] font-semibold"}>
                Tema
            </div>
            <SelectionComponent<ThemeMode>
                onSelection={onSelection}
                options={["system", "light", "dark"]}
                optionsNodes={optionsNodes}
                selected={mode}
                className={"flex space-x-2"}
                optionContainerClassName={"flex"}
            />
        </div>
    </>
}


function followingConfigToSelected(c: AlgorithmConfig["following"]) {
    if (!c) return "Cabildo Abierto"
    else if (c.format == "Artículos") return "Artículos"
    else if (c.filter == "Todos") return "Todos"
    else return "Cabildo Abierto"
}


const FeedDefaultsSettings = () => {
    const {user} = useSession()
    const [config, setConfig] = useState<AlgorithmConfig>(user.algorithmConfig)
    const qc = useQueryClient()

    function optionsNodes(o: string, selected: boolean) {
        return <button
            className={"text-sm rounded-lg px-2 cursor-pointer " + (selected ? "bg-[var(--primary)] text-[var(--button-text)]" : "bg-[var(--background-dark2)] text-[var(--text)]")}
        >
            {o}
        </button>
    }

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


    return <div className={"space-y-8"}>
        <div className={"space-y-2 bg-[var(--background-dark)] p-4 rounded-lg"}>
            <div className={"text-[var(--text-light)] font-semibold flex space-x-1"}>
                <div>
                    Siguiendo
                </div>
                <InfoPanel
                    moreInfoHref={topicUrl("Cabildo Abierto: Muros", undefined, "normal")}
                    text={"Configuración por defecto del muro Siguiendo."}
                />
            </div>
            <SelectionComponent
                onSelection={setFollowing}
                options={["Todos", "Cabildo Abierto", "Artículos"]}
                optionsNodes={optionsNodes}
                selected={following}
                className={"flex gap-x-2 gap-y-1 flex-wrap"}
                optionContainerClassName={""}
            />
        </div>
        <div className={"space-y-4 bg-[var(--background-dark)] p-4 rounded-lg"}>
            <div className={"text-[var(--text-light)] font-semibold flex space-x-1"}>
                <div>
                    En discusión
                </div>
                <InfoPanel
                    moreInfoHref={topicUrl("Cabildo Abierto: Muros", undefined, "normal")}
                    text={"Configuración por defecto del muro En discusión."}
                />
            </div>
            <div className={"space-y-4"}>
                <div>
                    <div className={"text-xs text-[var(--text-light)]"}>
                        Métrica
                    </div>
                    <SelectionComponent
                        onSelection={setEnDiscusionMetric}
                        options={["Popularidad relativa", "Me gustas", "Interacciones", "Recientes"]}
                        optionsNodes={optionsNodes}
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
                        optionsNodes={optionsNodes}
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
                        optionsNodes={optionsNodes}
                        selected={config.enDiscusion?.format ?? defaultEnDiscusionFormat}
                        className={"flex gap-x-2 gap-y-1 flex-wrap"}
                        optionContainerClassName={""}
                    />
                </div>
            </div>
        </div>
        <div className={"space-y-2 bg-[var(--background-dark)] p-4 rounded-lg"}>
            <div className={"text-[var(--text-light)] font-semibold flex space-x-1"}>
                <div>
                    Temas en tendencia
                </div>
                <InfoPanel
                    moreInfoHref={topicUrl("Cabildo Abierto: Popularidad de temas", undefined, "normal")}
                    text={"El período por defecto de los temas en la sección Temas y en el panel lateral (en PC)."}
                />
            </div>
            <SelectionComponent
                onSelection={setTTTime}
                options={["Último mes", "Última semana", "Último día"]}
                optionsNodes={optionsNodes}
                selected={config.tt?.time ?? "Última semana"}
                className={"flex gap-x-2 gap-y-1 flex-wrap"}
                optionContainerClassName={""}
            />
        </div>
        <div className={"space-y-4 bg-[var(--background-dark)] p-4 rounded-lg"}>
            <div className={"text-[var(--text-light)] font-semibold flex space-x-1"}>
                <div>
                    Muros de temas
                </div>
                <InfoPanel
                    moreInfoHref={topicUrl("Cabildo Abierto: Muros", undefined, "normal")}
                    text={"Configuración por defecto del muro de menciones de cada tema."}
                />
            </div>
            <div className={"space-y-4"}>
                <div>
                    <div className={"text-xs text-[var(--text-light)]"}>
                        Métrica
                    </div>
                    <SelectionComponent
                        onSelection={setTopicMentionsMetric}
                        options={["Popularidad relativa", "Me gustas", "Interacciones", "Recientes"]}
                        optionsNodes={optionsNodes}
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
                        optionsNodes={optionsNodes}
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
                        optionsNodes={optionsNodes}
                        selected={config.topicMentions?.format ?? defaultTopicMentionsFormat}
                        className={"flex gap-x-2 gap-y-1 flex-wrap"}
                        optionContainerClassName={""}
                    />
                </div>
            </div>
        </div>
        <div className={"link text-[var(--text-light)] text-sm"}>
            Todas las configuraciones también se pueden cambiar momentáneamente al estar viendo el contenido. Si querés una configuración que no ves acá, <Link href={topicUrl("Cabildo Abierto: Solicitudes de usuarios", undefined, "normal")}>sugerila</Link>.
        </div>
    </div>
}


const Ajustes = () => {
    const {user} = useSession()
    const [selected, setSelected] = useState("Cuenta")

    if (!user) {
        return <></>
    }

    return (
        <div className="">
            <div className={"border-b border-[var(--text-lighter)] flex"}>
                <SelectionComponent
                    selected={selected}
                    onSelection={(v) => {
                        setSelected(v)
                    }}
                    options={["Cuenta", "Apariencia", "Algoritmos"]}
                    optionsNodes={feedOptionNodes(40)}
                    className="flex h-full"
                />
            </div>
            <div className="py-4 px-8">
                {selected == "Cuenta" && <AccountSettings/>}
                {selected == "Apariencia" && <AppearanceSettings/>}
                {selected == "Algoritmos" && <FeedDefaultsSettings/>}
            </div>
        </div>
    )
};

export default Ajustes;
