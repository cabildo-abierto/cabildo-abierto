"use client"

import { createEntity } from "@/actions/create-entity"
import NeedAccountPopup from "@/components/need-account-popup"
import useUser from "@/components/use-user"

const CreateEntityButton = ({name}) => {
    return <button className="large-btn" onClick={() => {createEntity(name)}}>Crear entidad</button>
}

export default function NoEntityPage({id}){
    const user = useUser()

    const name = decodeURIComponent(id).replaceAll("_", " ")
    return <>
            <div className="flex justify-center py-8">
            <h1>No se encontró la entidad</h1>
            </div>
            <div className="flex justify-center py-8 text-lg">
                "{name}"
            </div>
            <div className="flex justify-center py-16">
                {user ? <CreateEntityButton name={name}/> :
                    <NeedAccountPopup
                        trigger={CreateEntityButton(name)}
                        text="Para crear entidades es necesario tener una cuenta"
                    />
                }
            </div>
    </>
}