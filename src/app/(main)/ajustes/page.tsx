"use client"

import React, {useState} from "react";
import {CustomLink as Link} from '../../../../modules/ui-utils/src/custom-link';
import {PermissionLevel} from "@/components/topics/topic/permission-level";
import {CloseSessionButton} from "@/components/auth/close-session-button";
import SelectionComponent from "@/components/buscar/search-selection-component";
import {useTheme} from "@/components/theme/theme-context";
import {useAccount, useCurrentValidationRequest, useProfile, useSession} from "@/queries/api";
import LoadingSpinner from "../../../../modules/ui-utils/src/loading-spinner";
import { Button } from "../../../../modules/ui-utils/src/button";
import {profileUrl} from "@/utils/uri";
import PageHeader from "../../../../modules/ui-utils/src/page-header";


const AccountSettings = () => {
    const {user} = useSession()
    const {account, isLoading} = useAccount()
    const {data: request, isLoading: requestLoading} = useCurrentValidationRequest()

    if(isLoading || requestLoading){
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
            <Link className="text-[var(--primary)] hover:underline" target="_blank" href={"https://bsky.app/settings/account"}>
                Cambiar desde Bluesky.
            </Link>
        </div>
        <div className="mb-4">
            <div className="text-[var(--text-light)] font-medium text-sm">Mail</div>
            {account.email ? <div className="text-lg ">{account.email}</div> : <div className="text-lg ">Pendiente</div>}
            <Link className="text-[var(--primary)] hover:underline" target="_blank" href={"https://bsky.app/settings/account"}>
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
        {(!request.result || request.result != "Aceptada") && <Button size={"small"} href={"/ajustes/solicitar-validacion"}>
            <span className={"font-semibold text-sm py-1"}>Verificar cuenta</span>
        </Button>}
        <div className={"mt-4 flex justify-start"}>
            <CloseSessionButton/>
        </div>
    </>
}


const AppearanceSettings = () => {
    const { mode, setMode } = useTheme();

    return <>
        <div className="mb-4">
            <div className="text-[var(--text-light)] font-medium text-sm mb-2">Tema</div>
            <div className="space-y-2">
                <div className="flex items-center">
                    <input
                        type="radio"
                        id="system"
                        name="theme"
                        value="system"
                        checked={mode === 'system'}
                        onChange={() => setMode('system')}
                        className="mr-2"
                    />
                    <label htmlFor="system" className="text-[var(--text)] cursor-pointer ">
                        Usar tema del sistema
                    </label>
                </div>
                <div className="flex items-center">
                    <input
                        type="radio"
                        id="light"
                        name="theme"
                        value="light"
                        checked={mode === 'light'}
                        onChange={() => setMode('light')}
                        className="mr-2"
                    />
                    <label htmlFor="light" className="text-[var(--text)] cursor-pointer">
                        Modo claro
                    </label>
                </div>
                <div className="flex items-center">
                    <input
                        type="radio"
                        id="dark"
                        name="theme"
                        value="dark"
                        checked={mode === 'dark'}
                        onChange={() => setMode('dark')}
                        className="mr-2"
                    />
                    <label htmlFor="dark" className="text-[var(--text)] cursor-pointer">
                        Modo oscuro
                    </label>
                </div>
            </div>
        </div>
    </>
}


const Ajustes = () => {
    const {user} = useSession()
    const [selected, setSelected] = useState("Cuenta")

    if (!user) {
        return <></>
    }

    function optionsNodes(o: string, isSelected: boolean) {
        return <div className="text-[var(--text)] w-36">
            <Button
                onClick={() => {
                }}
                variant="text"
                color="transparent"
                fullWidth={true}
                disableElevation={true}
                sx={{
                    textTransform: "none",
                    paddingY: 0,
                    borderRadius: 0
                }}
            >
                <div
                    className={"pb-1 pt-2 border-b-[4px] " + (isSelected ? "border-[var(--primary)] font-semibold border-b-[4px]" : "border-transparent")}>
                    {o}
                </div>
            </Button>
        </div>
    }

    return (
        <div className="mx-auto">
            <div className={"border-b"}>
                <PageHeader title={"Ajustes"}/>
                <div className={"flex"}>
                    <SelectionComponent
                        selected={selected}
                        onSelection={(v) => {
                            setSelected(v)
                        }}
                        options={["Cuenta", "Apariencia"]}
                        optionsNodes={optionsNodes}
                        className="flex"
                    />
                </div>
            </div>
            <div className="p-4">
                {selected == "Cuenta" && <AccountSettings/>}
                {selected == "Apariencia" && <AppearanceSettings/>}
            </div>
        </div>
    )
};

export default Ajustes;
