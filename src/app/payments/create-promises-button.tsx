"use client"

import { createPaymentPromises } from "../../actions/payments"


export const CreatePromisesButton = () => {
    return <button className="gray-btn" onClick={async () => {await createPaymentPromises()}}>
        Crear promesas
    </button>
}