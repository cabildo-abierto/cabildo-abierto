"use client"

import { recomputeAllContributions, revalidateEntities, revalidateContents, revalidateNotifications, revalidateUsers, revalidateFeed, revalidateDrafts, revalidateSearchkeys, compressContents, compressContent, decompressContents, decompressContent, updateIsDraft, deleteEntity, computeDayViews, computeSubscriptorsByDay, revalidateSuggestions, updateProfilesFromAT } from "../../actions/admin"
import { updateAllUniqueCommentators, notifyAllMentions, deleteUser } from "../../actions/contents"
import { recomputeEntityContributions } from "../../actions/entities"
import { updateAllReferences, updateAllWeakReferences } from "../../actions/references"
import { assignSubscriptions, buySubscriptions, desassignSubscriptions, recoverSubscriptions, removeSubscriptions } from "../../actions/users"
import { NotFoundPage } from "../../components/not-found-page"
import { ThreeColumnsLayout } from "../../components/three-columns"
import { useUser } from "../hooks/user"

import React from 'react';
import { ConfirmPaymentsButton, CreatePromisesButton } from "../payments/create-promises-button"
import { supportDid, tomasDid } from "../../components/utils"



export default function Page() {
    const {user} = useUser()

    if(!user || (user.editorStatus != "Administrator" && user.id != tomasDid)){
        return <NotFoundPage/>
    }

    const userId = "juan"
    const entityId = "Proyecto_de_ley_S984%2F24%3A_Financiamiento_de_la_educaci%C3%B3n_universitaria"

    let center = <div className="flex flex-col items-center mt-8">
        <h1>Panel de administrador</h1>
        <div className="py-8 flex flex-col items-center space-y-2 w-64 text-center">
            
            <h2>Pagos</h2>

            <button className="gray-btn" onClick={async () => {await buySubscriptions(supportDid, 500, "hola")}}>
                Comprar suscripciones
            </button>

            <button className="gray-btn" onClick={async () => {await recoverSubscriptions()}}>
                Recuperar suscripciones
            </button>

            <CreatePromisesButton/>
            <ConfirmPaymentsButton/>
            <button className="gray-btn" onClick={async () => {await recomputeAllContributions()}}>
                Recalcular contribuciones
            </button>
            <button className="gray-btn" onClick={async () => {await recomputeEntityContributions("C%C3%B3digo_Procesal_Civil_y_Comercial_de_la_Naci%C3%B3n")}}>
                Recalcular contribuciones entidad
            </button>

            <button className="gray-btn" onClick={async (e) => {desassignSubscriptions()}}>
                Desasignar suscripciones
            </button>

            <button className="gray-btn" onClick={async (e) => {removeSubscriptions()}}>
                Eliminar suscripciones
            </button>

            <button className="gray-btn" onClick={async () => {await assignSubscriptions()}}>
                Asignar suscripciones
            </button>

            <h2>Revalidar</h2>

            <button className="gray-btn" onClick={async () => {await revalidateEntities()}}>
                Revalidar temas
            </button>
            <button className="gray-btn" onClick={async () => {await revalidateContents()}}>
                Revalidar contenidos
            </button>
            <button className="gray-btn" onClick={async () => {await revalidateNotifications()}}>
                Revalidar notificaciones
            </button>
            <button className="gray-btn" onClick={async () => {await revalidateUsers()}}>
                Revalidar usuarios
            </button>
            <button className="gray-btn" onClick={async () => {await revalidateFeed()}}>
                Revalidar feed
            </button>
            <button className="gray-btn" onClick={async () => {await revalidateDrafts()}}>
                Revalidar drafts
            </button>
            <button className="gray-btn" onClick={async () => {await revalidateSearchkeys()}}>
                Revalidar search keys
            </button>
            <button className="gray-btn" onClick={async () => {await revalidateSuggestions()}}>
                Revalidar sugerencias
            </button>

            <h2>Contenido</h2>

            <button className="gray-btn" onClick={async () => {await compressContents()}}>
                Comprimir
            </button>
            <button className="gray-btn" onClick={async () => {await compressContent("cm1wa7d6c000o8wntc23olh1g")}}>
                Comprimir uno
            </button>
            <button className="gray-btn" onClick={async () => {await decompressContents()}}>
                Descomprimir contenidos
            </button>
            <button className="gray-btn" onClick={async () => {await decompressContent("cm20q7zys0003w80jqk227mw2")}}>
                Descomprimir contenido
            </button>

            <h2>Actualizar</h2>

            <button className="gray-btn" onClick={async () => {await updateProfilesFromAT()}}>
                Actualizar perfiles
            </button>
            <button className="gray-btn" onClick={async () => {await updateAllUniqueCommentators()}}>
                Actualizar unique comentators
            </button>
            <button className="gray-btn" onClick={async () => {await updateAllReferences()}}>
                Actualizar referencias
            </button>
            <button className="gray-btn" onClick={async () => {await updateAllWeakReferences()}}>
                Actualizar weak references
            </button>
            <button className="gray-btn" onClick={async () => {await updateIsDraft()}}>
                Actualizar isDraft
            </button>

            <h2>Operaciones sobre la discusión</h2>

            <button className="gray-btn" onClick={async () => {await notifyAllMentions()}}>
                Notificar menciones
            </button>
            <button className="gray-btn" onClick={async () => {await deleteUser(userId)}}>
                Eliminar usuario {userId}
            </button>
            <button className="gray-btn" onClick={async () => {await deleteEntity(entityId, supportDid)}}>
                Eliminar tema {entityId}
            </button>

            <h2>Estadísticas</h2>

            <button className="gray-btn" onClick={async () => {await computeSubscriptorsByDay(500)}}>
                Calcular suscriptores por día
            </button>
            <button className="gray-btn" onClick={async () => {await computeSubscriptorsByDay(0)}}>
                Calcular cuentas por día
            </button>
            <button className="gray-btn" onClick={async () => {await computeDayViews()}}>
                Views por día
            </button>
            <button className="gray-btn" onClick={async () => {await computeDayViews(true)}}>
                Views en entidades día
            </button>

        </div>
    </div>

    return <ThreeColumnsLayout center={center}/>
}