"use client"

import { recomputeAllContributions, recomputeEntityContributions } from "../../actions/entities"
import { createPaymentPromises, confirmPayments, addDonatedSubscriptionsManually } from "../../actions/users"
import { NotFoundPage } from "../../components/not-found-page"
import { ThreeColumnsLayout } from "../../components/three-columns"
import { useUser } from "../hooks/user"



export default function Page() {
    const {user} = useUser()

    if(!user || user.editorStatus != "Administrator"){
        return <NotFoundPage/>
    }

    const center = <div>
        <h1>Pagos</h1>
        <div className="py-8 flex flex-col space-y-2">
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
        </div>
    </div>

    return <ThreeColumnsLayout center={center}/>
}