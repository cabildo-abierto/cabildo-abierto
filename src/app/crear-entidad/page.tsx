"use client"

import React from "react"
import {getPostsAndDiscussions} from "@/actions/get-comment";
import Feed from "@/components/feed";
import { useFormState, useFormStatus } from "react-dom";
import { AuthenticationFormLabel } from "../signup-form";
import {createEntity} from "@/actions/create-entity";


export function CreateButton() {
    const {pending} = useFormStatus()

    return (
        <button aria-disabled={pending} type="submit" className="bg-gray-200 py-2 rounded w-full disabled:bg-slate-50 disabled:text-slate-500 transition duration-300 ease-in-out transform hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50">
            {pending ? 'Creando entidad...' : 'Crear entidad'}
        </button>
    )
}


function EntidadForm() {
    const [state, action] = useFormState(createEntity, undefined)

    return (
        <div className="space-y-3 items-center">
            <form action={action}>
                <div className="flex-1 rounded-lg px-6 pb-4 pt-8">
                    <div className="w-full mb-3">
                        <div>
                            <AuthenticationFormLabel text="Nombre de la entidad" label="name"/>
                            <input
                                className="peer block w-full rounded-md border border-gray-200 py-[9px] px-3 text-sm outline-2 placeholder:text-gray-500"
                                placeholder=""
                                type="text"
                                id="name"
                                name="name"
                                defaultValue=''
                            />
                        </div>
                        {
                            state?.errors?.name
                            && <div className="text-sm text-red-500">
                                {state?.errors?.name.join(', ')}
                            </div>
                        }
                    </div>

                    <CreateButton/>
                </div>
            </form>
        </div>
    )
}


const CrearEntidad: React.FC = () => {
    return <div className="mx-auto max-w-4xl bg-white border-l border-r h-full">
        <h1 className="text-2xl ml-2 py-8 font-semibold mb-8">
            Crear entidad
        </h1>
        <EntidadForm/>
    </div>
}

export default CrearEntidad