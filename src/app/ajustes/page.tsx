"use client"

import React, {useState} from "react";
import { CustomLink as Link } from '../../../modules/ui-utils/src/custom-link';
import { PermissionLevel } from "@/components/topics/topic/permission-level";
import {CloseSessionButton} from "@/components/auth/close-session-button";
import SelectionComponent from "@/components/buscar/search-selection-component";
import {Button} from "@mui/material";
import { useTheme } from "@/components/theme/theme-context";
import {useAccount, useSession} from "@/hooks/swr";
import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner";



const AccountSettings = () => {
    const {user} = useSession()
    const {account, isLoading} = useAccount()

    if(isLoading){
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
            <div className="text-[var(--text-light)] font-medium text-sm">Mail</div>
            {account.email ? <div className="text-lg ">{account.email}</div> : <div className="text-lg ">Pendiente</div>}
        </div>
        <div className="mb-4">
            <div className="text-[var(--text-light)] font-medium text-sm">Nivel de permisos de edición</div>
            <div className="text-lg">
                <PermissionLevel level={user.editorStatus} className={""}/>
            </div>
        </div>
        <div className="mt-6 space-y-4 link">
            {/*<Link href="/recuperar/nueva" className="block text-blue-600 hover:underline">
                Cambiar contraseña
            </Link>*/}
            <Link href={`/perfil/${user.did}`} className="block hover:underline">
                Ver perfil
            </Link>
            {/*<Link href="/panel" className="block text-blue-600 hover:underline">
                Ver mis estadísticas
            </Link>*/}
        </div>
        <div className={"mt-4 flex justify-end"}>
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


const Cuenta: React.FC = () => {
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
                color="inherit"
                fullWidth={true}
                disableElevation={true}
                sx={{
                    textTransform: "none",
                    paddingY: 0
                }}
            >
                <div
                    className={"pb-1 pt-2 border-b-[4px] " + (isSelected ? "border-[var(--primary)] font-semibold border-b-[4px]" : "border-transparent")}>
                    {o}
                </div>
            </Button>
        </div>
    }

    const center = (
        <div className="max-w-lg mx-auto">
            <div className={"border-b"}>
                <h3 className="text-xl font-semibold py-6 text-center">
                    Ajustes
                </h3>
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
            <div className="pl-6 pr-4 py-6 pb-4">
                {selected == "Cuenta" && <AccountSettings/>}
                {selected == "Apariencia" && <AppearanceSettings/>}
            </div>
        </div>
    );

    return center
};

export default Cuenta;
