"use client"

import { useRouter } from "next/navigation"
import React from "react"
import { useSWRConfig } from "swr"
import { createEntity } from "../actions/entities"
import { useUser } from "../app/hooks/user"
import NeedSubscriptionPopupPanel from "./need-subscription-popup"
import Popup from "./popup"
import { articleUrl, validSubscription } from "./utils"

const CreateEntityButton: React.FC<any> = ({onClick}) => {
    return <button 
            className="gray-btn"
            onClick={onClick}
        >
            Crear artículo
    </button>
}

export default function NoEntityPage({id}: {id: string}){
    const name = decodeURIComponent(id).replaceAll("_", " ")
    const url = articleUrl(id)
    const router = useRouter()
    const {user} = useUser()
    const {mutate} = useSWRConfig()

    const handleCreateEntity = async () => {
        if(user) {
            await createEntity(name, user.id)
            mutate("/api/entities")
            mutate("/api/entity/"+id)
            router.push(url)
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