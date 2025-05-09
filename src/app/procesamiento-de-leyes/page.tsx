"use client"
import {PageCardMessage} from "@/components/aportar/page-card-message";



export default function Page(){
    return <PageCardMessage
        title={"Próximamente"}
        content={<div>
            Pronto este link te va a llevar a un repositorio de código abierto.
        </div>}
    />
}