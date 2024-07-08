"use client"

import React from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { createEntity } from '@/actions/create-entity';
import Popup from 'reactjs-popup';
import styles from './Modal.module.css'
import { SidebarButton } from '@/components/sidebar';
import CloseIcon from '@mui/icons-material/Close';

function EntityPopup() {
  const [state, action] = useFormState(createEntity, undefined);

  function children(close) { return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-10">
      <div className="relative bg-white p-8 rounded-lg w-full max-w-md" role="alert">
        <button
            className="absolute top-2 right-2"
            onClick={close}
        >
            <CloseIcon/>
        </button>
        <h1 className="text-2xl font-semibold mb-4">Crear entidad</h1>
        <form action={action}>
          <div className="space-y-3">
            <div>
              <input
                className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm outline-none placeholder-gray-500"
                type="text"
                id="name"
                name="name"
                defaultValue=""
                placeholder="Título"
              />
            </div>
            {state?.errors?.name && (
              <div className="text-sm text-red-500">{state?.errors?.name.join(', ')}</div>
            )}
            <CreateButton onClose={close}/>
          </div>
        </form>
      </div>
    </div>
  )}

  return <Popup
    trigger={SidebarButton({text: "Crear entidad"})}
    modal
    nested
  >
    {children}
  </Popup>
}

export function CreateButton({onClose}) {
    const {pending} = useFormStatus()

    return (
        <button aria-disabled={pending} type="submit" className="bg-gray-200 py-2 rounded w-full disabled:bg-slate-50 disabled:text-slate-500 transition duration-300 ease-in-out transform hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50">
            {pending ? 'Creando entidad...' : 'Crear'}
        </button>
    )
}

export default EntityPopup;
