"use client"

import { NotFoundPage } from "../../components/not-found-page"
import { useUser } from "../../hooks/user"

import React from 'react';
import { tomasDid } from "../../components/utils"
import StateButton from "../../components/state-button";
import {updateReferences} from "../../actions/references";



export default function Page() {
    const {user} = useUser()

    if(!user || (user.editorStatus != "Administrator" && user.did != tomasDid)){
        return <NotFoundPage/>
    }

    let center = <div className="flex flex-col items-center mt-8">
        <h1>Panel de administrador</h1>
        <div className="py-8 flex flex-col items-center space-y-2 w-64 text-center">

            <h2>Contenidos</h2>

            <StateButton
                handleClick={async () => {
                    await updateReferences()
                    return {}
                }}
                text1={"Actualizar todas las referencias"}
            />

        </div>
    </div>

    return center
}