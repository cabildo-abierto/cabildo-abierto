import { Chatbox } from "../../components/chat/chatbox";

import {supportDid} from "../../utils/auth";





export default async function Page() {
    
    const center = <div className="text-center">
        <h1 className="text-xl pt-6 pb-2">Chateá con el equipo de Cabildo Abierto</h1>
        <div className="text-gray-600 text-base">
            Te va a responder una persona real en menos de 24hs.
        </div>
        <div className="flex justify-center mt-6">
            <Chatbox toUser={supportDid}/>
        </div>
    </div>

    return center
}