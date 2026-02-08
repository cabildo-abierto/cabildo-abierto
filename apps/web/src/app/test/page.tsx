"use client"
import {ArCabildoabiertoEmbedPoll} from "@cabildo-abierto/api"
import {Poll} from "@/components/writing/poll/poll";


export default function Page() {

    const votacion: ArCabildoabiertoEmbedPoll.Main = {
        $type: "ar.cabildoabierto.embed.poll",
        description: "La primera encuesta",
        choices: ["opción 1", "opción 2"]
    }

    return <div>
        <h1>
            Página de prueba
        </h1>
        <div>
            <div>
                A continuación, una encuesta.
            </div>
            <Poll poll={votacion}/>
        </div>
    </div>
}