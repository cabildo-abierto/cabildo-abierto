"use client"

import { createEntity } from "@/actions/create-entity"
import NeedSubscriptionPopupPanel from "@/components/need-subscription-popup"
import Popup from "@/components/popup"
import { validSubscription } from "@/components/utils"
import { redirect, useRouter } from "next/navigation"
import React from "react"

const CreateEntityButton: React.FC<any> = ({onClick}) => {
    return <button 
            className="gray-btn"
            onClick={onClick}
        >
            Crear artículo
    </button>
}

export default function NoEntityPage({id, user}: any){
    const name = decodeURIComponent(id).replaceAll("_", " ")
    const url = "/articulo/"+id
    const router = useRouter()

    const handleCreateEntity = async () => {
        if(user) {
            await createEntity(name, user.id)
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