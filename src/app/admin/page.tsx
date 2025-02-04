"use client"

import { buySubscriptions, desassignSubscriptions, removeSubscriptions, unsafeCreateUserFromDid } from "../../actions/users"
import { NotFoundPage } from "../../components/not-found-page"
import { useUser } from "../../hooks/user"

import React from 'react';
import { supportDid, tomasDid } from "../../components/utils"
import {
    revalidateEntities,
    revalidateContents,
    revalidateNotifications,
    revalidateUsers,
    revalidateFeed,
    revalidateDrafts,
    revalidateSearchkeys,
    revalidateSuggestions,
    deleteUser
} from "../../actions/admin"



export default function Page() {
    const {user} = useUser()

    if(!user || (user.editorStatus != "Administrator" && user.did != tomasDid)){
        return <NotFoundPage/>
    }

    const userId = "usuariodepruebas2.bsky.social"
    const entityId = "Proyecto_de_ley_S984%2F24%3A_Financiamiento_de_la_educaci%C3%B3n_universitaria"

    let center = <div className="flex flex-col items-center mt-8">
        <h1>Panel de administrador</h1>
        <div className="py-8 flex flex-col items-center space-y-2 w-64 text-center">

            <h2>Usuarios</h2>

            <button className="gray-btn" onClick={async () => {
                await unsafeCreateUserFromDid(userId)
            }}>
                Crear usuario {userId}
            </button>

            <button className="gray-btn" onClick={async () => {
                await deleteUser(userId)
            }}>
                Eliminar usuario {userId}
            </button>

            <h2>Pagos</h2>

            <button className="gray-btn" onClick={async () => {
                await buySubscriptions(supportDid, 500, "hola")
            }}>
                Comprar suscripciones
            </button>

            <button className="gray-btn" onClick={async (e) => {
                desassignSubscriptions()
            }}>
                Desasignar suscripciones
            </button>

            <button className="gray-btn" onClick={async (e) => {
                removeSubscriptions()
            }}>
                Eliminar suscripciones
            </button>

            <h2>Revalidar</h2>

            <button className="gray-btn" onClick={async () => {
                await revalidateEntities()
            }}>
                Revalidar temas
            </button>
            <button className="gray-btn" onClick={async () => {
                await revalidateContents()
            }}>
                Revalidar contenidos
            </button>
            <button className="gray-btn" onClick={async () => {
                await revalidateNotifications()
            }}>
                Revalidar notificaciones
            </button>
            <button className="gray-btn" onClick={async () => {
                await revalidateUsers()
            }}>
                Revalidar usuarios
            </button>
            <button className="gray-btn" onClick={async () => {
                await revalidateFeed()
            }}>
                Revalidar feed
            </button>
            <button className="gray-btn" onClick={async () => {
                await revalidateDrafts()
            }}>
                Revalidar drafts
            </button>
            <button className="gray-btn" onClick={async () => {
                await revalidateSearchkeys()
            }}>
                Revalidar search keys
            </button>
            <button className="gray-btn" onClick={async () => {
                await revalidateSuggestions()
            }}>
                Revalidar sugerencias
            </button>

        </div>
    </div>

    return center
}