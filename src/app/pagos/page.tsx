"use client"

import { createPaymentPromises, confirmPayments } from "../../actions/users"
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
        </div>
    </div>

    return <ThreeColumnsLayout center={center}/>
}