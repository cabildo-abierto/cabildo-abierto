"use client"

import React, {useState} from "react";
import { useUser } from "../../hooks/user";
import { CustomLink as Link } from '../../components/ui-utils/custom-link';
import { PermissionLevel } from "../../components/topic/permission-level";
import {CloseSessionButton} from "../../components/auth/close-session-button";
import SelectionComponent from "../../components/search/search-selection-component";
import {Button} from "@mui/material";
import { useTheme } from "../../components/theme/theme-context";



const AccountSettings = () => {
    const {user} = useUser();

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
            {user.email ? <div className="text-lg ">{user.email}</div> : <div className="text-lg ">Pendiente</div>}
        </div>
        <div className="mb-4">
            <div className="text-[var(--text-light)] font-medium text-sm">Nivel de permisos de edición</div>
            <div className="text-lg">
                <PermissionLevel level={user.editorStatus}/>
            </div>
        </div>
        <div className="mt-6 space-y-4">
            <Link href="/recuperar/nueva" className="block text-blue-600 hover:underline">
                Cambiar contraseña
            </Link>
            <Link href={`/perfil/${user.did}`} className="block text-blue-600 hover:underline">
                Ir a mi perfil
            </Link>
            <Link href="/panel" className="block text-blue-600 hover:underline">
                Ver mis estadísticas
            </Link>
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
                        onChange={(e) => setMode('system')}
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
                        onChange={(e) => setMode('light')}
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
                        onChange={(e) => setMode('dark')}
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
    const {user} = useUser()
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
        <div className="py-8 max-w-lg mx-auto">
            <h3 className="text-2xl font-semibold mb-6 text-center">Ajustes</h3>
            <div className={"flex border-t border-r border-l rounded-t"}>
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
            <div className="border p-6 rounded-b">
                {selected == "Cuenta" && <AccountSettings/>}
                {selected == "Apariencia" && <AppearanceSettings/>}
            </div>
        </div>
    );

    return center
};

export default Cuenta;
