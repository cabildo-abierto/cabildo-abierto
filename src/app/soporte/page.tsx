import Link from "next/link";
import { getChatBetween, getUser } from "../../actions/users";
import { Chatbox } from "../../components/chatbox";
import { ThreeColumnsLayout } from "../../components/three-columns";





export default async function Page() {
    const user = await getUser()

    if(!user) return <></>
    
    const center = <div className="text-center">
        <h1 className="text-xl pt-6 pb-2">Chateá con el equipo de Cabildo Abierto</h1>
        <div className="text-gray-600 text-base">
            Te va a responder una persona real en menos de 24hs.
        </div>
        <div className="flex justify-center mt-6">
            <Chatbox toUser="soporte"/>
        </div>
        {user.editorStatus == "Administrator" && <div className="mt-2"><Link href="/soporte/responder" className="gray-btn">Responder</Link></div>}
    </div>

    return <ThreeColumnsLayout center={center}/>
}