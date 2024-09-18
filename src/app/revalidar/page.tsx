"use client"
import { revalidateEntities } from "../../actions/entities";
import { NotFoundPage } from "../../components/not-found-page";
import { ThreeColumnsLayout } from "../../components/three-columns";
import { useUser } from "../hooks/user";



export default function Page(){
    const {user} = useUser()

    if(!user || user.editorStatus != "Administrator"){
        return <NotFoundPage/>
    }

    const center = <div className="text-center">
        <h3 className="py-8">Revalidar</h3>

        <div className="space-y-2">
        <button className="gray-btn" onClick={async () => {await revalidateEntities()}}>
            Artículos
        </button>
        </div>
    </div>

    return <ThreeColumnsLayout center={center}/>
}