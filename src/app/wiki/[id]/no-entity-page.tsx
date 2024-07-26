"use client"

import { createEntity } from "@/actions/create-entity"
import NeedAccountPopup from "@/components/need-account-popup"
import { updateEntities } from "@/components/update-context"
import { useEntities } from "@/components/use-entities"
import { useUser } from "@/components/user-provider"
import { useRouter } from "next/navigation"
import React from "react"

const CreateEntityButton: React.FC<{name?: string | null, userId?: string | null}> = ({name = null, userId = null}) => {
    const router = useRouter()
    const {setEntities} = useEntities()

    if(!name || !userId){
        return <button 
            className="large-btn"
            disabled={true}
        >Crear artículo
        </button>   
    }

    const url = "/wiki/"+encodeURIComponent(name)

    const handleCreateEntity = async () => {
        if(userId) {
            await createEntity(name, userId).then(async () => {
                await updateEntities(setEntities).then(() => {
                    router.push(url)
                })
            })
        }
    }

    return <button 
        className="large-btn" 
        onClick={handleCreateEntity}
    >Crear artículo
    </button>
}

export default function NoEntityPage({id}: {id: string}){
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
                        trigger={CreateEntityButton({})}
                        text="Para crear entidades es necesario tener una cuenta"
                    />
                }
            </div>
    </>
}