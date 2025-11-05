"use client"
import {SendButton} from "@/components/ajustes/verificar/send-button";
import {useState} from "react";
import {MPValidationRequestProps} from "@/components/ajustes/verificar/types";


export default function Page() {
    const [request, setRequest] = useState<Partial<MPValidationRequestProps>>()
    return <div className={"space-y-6 pt-4"}>
        <div>
            Para verificar tu cuenta con Mercado Pago vamos a hacer un pago de $1 (un peso), y luego te lo reembolsamos. Si preferís, podés aprovechar
        </div>

        <div className={"flex justify-end pr-4"}>
            <SendButton request={request}/>
        </div>
    </div>
}