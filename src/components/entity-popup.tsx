"use client"

import React from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { createEntityFromForm } from '@/actions/create-entity';
import { useRouter } from 'next/navigation';
import Popup from './popup';


export default function EntityPopup({disabled = false}) {
  const [state, action] = useFormState(createEntityFromForm, null);
  const router = useRouter()

  if(state && !state.error){
    router.push("/wiki/"+state.id)
  }

  const panel: React.FC<any> = ({onClose}) => { return <>
      <form action={action}>
          <div className="space-y-3">
            <h3>Crear entidad</h3>
            <div>
              <input
                className="block w-64 rounded-md border border-gray-200 py-2 px-3 text-sm outline-none placeholder-gray-500"
                type="text"
                id="name"
                name="name"
                defaultValue=""
                placeholder="Título"
              />
            </div>
            {(state && state.error) && (
              <div className="text-sm text-red-500">{state.error}</div>
            )}
            <div className="py-4">
              <CreateButton/>
            </div>
          </div>
      </form>
  </>}

  const trigger: React.FC<any> = ({onClick}) => {
    return <button className="large-btn scale-btn" onClick={onClick} disabled={disabled}>
      Crear artículo
    </button>
  }

  return <Popup Panel={panel} Trigger={trigger}/>
}


export function CreateButton() {
    const {pending} = useFormStatus()

    return (
        <button aria-disabled={pending} type="submit" className="bg-gray-200 py-2 rounded w-full disabled:bg-slate-50 disabled:text-slate-500 transition duration-300 ease-in-out transform hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50">
            {pending ? 'Creando entidad...' : 'Crear'}
        </button>
    )
}
