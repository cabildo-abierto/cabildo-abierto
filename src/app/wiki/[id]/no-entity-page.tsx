"use client"

import { createEntity } from "@/actions/create-entity"
import NeedSubscriptionPopupPanel from "@/components/need-subscription-popup"
import Popup from "@/components/popup"
import { useEntities } from "@/components/use-entities"
import { useUser } from "@/components/user-provider"
import { validSubscription } from "@/components/utils"
import { useRouter } from "next/navigation"
import React from "react"

const CreateEntityButton: React.FC<any> = ({onClick}) => {
    return <button 
            className="large-btn"
            onClick={onClick}
        >
            Crear artículo
    </button>
}

export default function NoEntityPage({id}: {id: string}){
    const {user} = useUser()
    const {setEntities} = useEntities()
    const router = useRouter()

    const name = decodeURIComponent(id).replaceAll("_", " ")
    const url = "/wiki/"+id

    const handleCreateEntity = async () => {
        if(user) {
            await createEntity(name, user.id).then(async () => {
                setEntities(undefined)
                router.push(url)
            })
        }
    }

    return <>
            <div className="flex justify-center py-8">
            <h1>No se encontró el artículo</h1>
            </div>
            <div className="flex justify-center py-8 text-lg">
                {'"'+name+'"'}
            </div>
            <div className="flex justify-center py-16">
                {validSubscription(user) ? <CreateEntityButton onClick={handleCreateEntity}/> :
                    <Popup
                        Panel={NeedSubscriptionPopupPanel}
                        Trigger={CreateEntityButton}
                    />
                }
            </div>
    </>
}