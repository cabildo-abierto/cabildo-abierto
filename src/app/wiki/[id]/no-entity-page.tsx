"use client"

import { createEntity } from "@/actions/create-entity"



export default function NoEntityPage({id}){
    const name = decodeURI(id).replace("_", " ")
    return <>
            <div className="flex justify-center py-8">
            <h1>No se encontró la entidad</h1>
            </div>
            <div className="flex justify-center py-8 text-lg">
                "{name}"
            </div>
            <div className="flex justify-center py-16">
            <button className="large-btn" onClick={() => {createEntity(name)}}>Crear entidad</button>
            </div>
    </>
}