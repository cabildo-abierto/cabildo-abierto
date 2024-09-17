"use client"

import React from "react";
import { ThreeColumnsLayout } from "../../components/three-columns";
import { useUser } from "../hooks/user";
import Link from "next/link";
import { validSubscription } from "../../components/utils";


const Cuenta: React.FC = () => {
    const {user} = useUser()

    if(!user){
        return <></>
    }

    const center = (
        <div className="py-8 max-w-lg mx-auto">
            <h3 className="text-2xl font-semibold mb-6 text-center">Cuenta</h3>
            <div className="bg-white shadow rounded-lg p-6">
                <div className="mb-4">
                    <div className="text-gray-600 font-medium">Nombre de usuario:</div>
                    <div className="text-lg text-gray-900">@{user.id}</div>
                </div>
                <div className="mb-4">
                    <div className="text-gray-600 font-medium">Nombre:</div>
                    <div className="text-lg text-gray-900">{user.name}</div>
                </div>
                <div className="mb-4">
                    <div className="text-gray-600 font-medium">Mail:</div>
                    <div className="text-lg text-gray-900">{user.authUser.email}</div>
                </div>
                <div className="mb-4">
                    <div className="text-gray-600 font-medium">Estado de la suscripción:</div>
                    <div className={`text-lg ${validSubscription(user) ? 'text-green-600' : 'text-red-600'}`}>
                        {validSubscription(user) ? "Activa" : "Sin suscripción"}
                    </div>
                </div>
                <div className="mt-6 space-y-4">
                    <Link href="/recuperar/nueva" className="block text-blue-600 hover:underline">
                        Cambiar contraseña
                    </Link>
                    <Link href={`/perfil/${user.id}`} className="block text-blue-600 hover:underline">
                        Ir a mi perfil
                    </Link>
                </div>
            </div>
        </div>
    );

    return <ThreeColumnsLayout center={center} />;
};

export default Cuenta;
