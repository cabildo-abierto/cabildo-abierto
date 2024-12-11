"use client"

import { buySubscriptions, desassignSubscriptions, removeSubscriptions, unsafeCreateUserFromDid } from "../../actions/users"
import { NotFoundPage } from "../../components/not-found-page"
import { ThreeColumnsLayout } from "../../components/three-columns"
import { useUser } from "../../hooks/user"

import React from 'react';
import { supportDid, tomasDid } from "../../components/utils"
import { updatePosts } from "../../actions/atproto-update"
import { revalidateEntities, revalidateContents, revalidateNotifications, revalidateUsers, revalidateFeed, revalidateDrafts, revalidateSearchkeys, revalidateSuggestions, updateProfilesFromAT } from "../../actions/admin"
import {deleteTopicVersionsForUser, updateTopics} from "../../actions/topics";



export default function Page() {
    const {user} = useUser()

    if(!user || (user.editorStatus != "Administrator" && user.did != tomasDid)){
        return <NotFoundPage/>
    }

    const userId = "did:plc:of56nmyuqzvjta7qlf7gwht6"
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

            <h2>Contenido</h2>

            <h2>Actualizar</h2>

            <button className="gray-btn" onClick={async () => {
                await updateTopics()
            }}>
                Actualizar temas
            </button>
            <button className="gray-btn" onClick={async () => {
                await updatePosts()
            }}>
                Actualizar posts
            </button>
            <button className="gray-btn" onClick={async () => {
                await updateProfilesFromAT()
            }}>
                Actualizar perfiles
            </button>

            <button className="gray-btn" onClick={async () => {await deleteTopicVersionsForUser()}}>
                Eliminar temas
            </button>

        </div>
    </div>

    return <ThreeColumnsLayout center={center}/>
}