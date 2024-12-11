"use client"

import React from "react";
import { ThreeColumnsLayout } from "../../components/three-columns";
import { useUser } from "../../hooks/user";
import { CustomLink as Link } from '../../components/custom-link';
import { PermissionLevel } from "../../components/permission-level";


const Cuenta: React.FC = () => {
    const {user, bskyProfile} = useUser()

    if(!user || !bskyProfile) {
        return <></>
    }

    const center = (
        <div className="py-8 max-w-lg mx-auto">
            <h3 className="text-2xl font-semibold mb-6 text-center">Cuenta</h3>
            <div className="bg-[var(--background2)] shadow rounded-lg p-6">
                <div className="mb-4">
                    <div className="text-[var(--text-light)] font-medium">Nombre de usuario:</div>
                    <div className="text-lg ">@{user.handle}</div>
                </div>
                <div className="mb-4">
                    <div className="text-[var(--text-light)] font-medium">Nombre visible:</div>
                    <div className="text-lg ">{bskyProfile.displayName ? bskyProfile.displayName : "Sin definir."}</div>
                </div>
                <div className="mb-4">
                    <div className="text-[var(--text-light)] font-medium">Mail:</div>
                    {user.email ? <div className="text-lg ">{user.email}</div> : <div className="text-lg ">Pendiente</div>}
                </div>
                <div className="mb-4">
                    <div className="text-[var(--text-light)] font-medium">Nivel de permisos de edición:</div>
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
            </div>
        </div>
    );

    return <ThreeColumnsLayout center={center} />;
};

export default Cuenta;
