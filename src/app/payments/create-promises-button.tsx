"use client"

import { confirmPayments, createPaymentPromises } from "../../actions/payments"


export const CreatePromisesButton = () => {
    return <button className="gray-btn" onClick={async () => {await createPaymentPromises()}}>
        Crear promesas
    </button>
}


export const ConfirmPaymentsButton = () => {
    return <button className="gray-btn" onClick={async () => {await confirmPayments()}}>
        Confirmar pagos
    </button>
}
