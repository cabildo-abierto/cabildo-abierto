import {Metadata} from "next"
import {PageCardMessage} from "@/components/aportar/page-card-message";

export const metadata: Metadata = {
    title: 'Error en el pago'
}

export default function Page(){
    return <PageCardMessage
        title={"Parece que hubo un problema en el procesamiento de tu aporte"}
        content={"Si el pago se realizó y no lo ves en Cabildo Abierto, por favor escribinos a soporte@cabildoabierto.ar."}
    />
}