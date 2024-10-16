"use client"

import { compressContents, compressContent, decompressContents, decompressContent, notifyAllMentions, deleteUser, updateAllUniqueCommentators, updateAllReferences } from "../../actions/contents"
import { recomputeAllContributions, recomputeEntityContributions, revalidateContents, revalidateDrafts, revalidateEntities, revalidateFeed, revalidateNotifications, revalidateUsers, updateUniqueViewsCount } from "../../actions/entities"
import { createPaymentPromises, confirmPayments, addDonatedSubscriptionsManually, computeSubscriptorsByDay, computeDayViews } from "../../actions/users"
import { NotFoundPage } from "../../components/not-found-page"
import { ThreeColumnsLayout } from "../../components/three-columns"
import { useUser } from "../hooks/user"



export default function Page() {
    const {user} = useUser()

    if(!user || user.editorStatus != "Administrator"){
        return <NotFoundPage/>
    }

    const userId = "prueba2"

    const center = <div className="flex flex-col items-center mt-8">
        <h1>Panel de administrador</h1>
        <div className="py-8 flex flex-col items-center space-y-2 w-64">
            <button className="gray-btn" onClick={async () => {await createPaymentPromises()}}>
                Crear promesas
            </button>
            <button className="gray-btn" onClick={async () => {await confirmPayments()}}>
                Confirmar pagos
            </button>
            <button className="gray-btn" onClick={async () => {await recomputeAllContributions()}}>
                Recalcular contribuciones
            </button>
            <button className="gray-btn" onClick={async () => {await recomputeEntityContributions("C%C3%B3digo_Procesal_Civil_y_Comercial_de_la_Naci%C3%B3n")}}>
                Recalcular contribuciones entidad
            </button>
            <button className="gray-btn" onClick={async () => {await addDonatedSubscriptionsManually("Fer1974", 9, 500, "89515361127")}}>
                Asignar suscripciones
            </button>
            
            <button className="gray-btn" onClick={async () => {await revalidateEntities()}}>
                Revalidar artículos
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
            <button className="gray-btn" onClick={async () => {await updateAllUniqueCommentators()}}>
                Actualizar unique comentators
            </button>
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
            <button className="gray-btn" onClick={async () => {await updateUniqueViewsCount()}}>
                Actualizar unique views
            </button>
            <button className="gray-btn" onClick={async () => {await updateAllReferences()}}>
                Actualizar referencias
            </button>
            <button className="gray-btn" onClick={async () => {await notifyAllMentions()}}>
                Notificar menciones
            </button>
            <button className="gray-btn" onClick={async () => {await deleteUser(userId)}}>
                Eliminar usuario {userId}
            </button>
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