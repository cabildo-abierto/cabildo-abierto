"use client"

import { createEntity } from "@/actions/create-entity"
import NeedAccountPopup from "@/components/need-account-popup"
import { useUser } from "@/components/user-provider"
import { useRouter } from "next/navigation"

const CreateEntityButton = ({name, userId}) => {
    const router = useRouter()
    const url = "/wiki/"+encodeURIComponent(name)
    return <button 
        className="large-btn" 
        onClick={async () => {if(userId) await createEntity(name, userId).then(() => {router.push("url")})}}
    >Crear entidad
    </button>
}

export default function NoEntityPage({id}){
    const {user} = useUser()

    const name = decodeURIComponent(id).replaceAll("_", " ")
    return <>
            <div className="flex justify-center py-8">
            <h1>No se encontró la entidad</h1>
            </div>
            <div className="flex justify-center py-8 text-lg">
                {'"'+name+'"'}
            </div>
            <div className="flex justify-center py-16">
                {user ? <CreateEntityButton name={name} userId={user?.id}/> :
                    <NeedAccountPopup
                        trigger={CreateEntityButton({name: name, userId: user?.id})}
                        text="Para crear entidades es necesario tener una cuenta"
                    />
                }
            </div>
    </>
}