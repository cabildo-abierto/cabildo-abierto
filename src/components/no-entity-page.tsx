"use client"

import { useRouter } from "next/navigation"
import React from "react"
import { useSWRConfig } from "swr"
import { createEntity } from "../actions/entities"
import { useUser } from "../app/hooks/user"
import NeedSubscriptionPopupPanel from "./need-subscription-popup"
import Popup from "./popup"
import { articleUrl, validSubscription } from "./utils"
import { validEntityName } from "./write-button"

const CreateEntityButton: React.FC<any> = ({onClick}) => {
    return <button 
            className="gray-btn"
            onClick={onClick}
        >
            Crear tema
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
        <h1>No se encontró el tema</h1>
        </div>
        <div className="flex justify-center py-8 text-lg">
            {'"'+name+'"'}
        </div>
        {validEntityName(name) ? <div className="flex justify-center py-16">
            {validSubscription(user) ? <CreateEntityButton onClick={handleCreateEntity}/> :
                <Popup
                    Panel={NeedSubscriptionPopupPanel}
                    Trigger={CreateEntityButton}
                />
            }
        </div> : <div className="py-16 flex justify-center text-center">Tampoco se puede crear el tema porque su nombre no es válido.</div>}
    </>
}