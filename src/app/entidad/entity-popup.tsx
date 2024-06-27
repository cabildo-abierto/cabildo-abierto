"use client"

import React from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { AuthenticationFormLabel } from '../signup-form';
import { createEntity } from '@/actions/create-entity';

export function CreateButton() {
    const {pending} = useFormStatus()

    return (
        <button aria-disabled={pending} type="submit" className="bg-gray-200 py-2 rounded w-full disabled:bg-slate-50 disabled:text-slate-500 transition duration-300 ease-in-out transform hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50">
            {pending ? 'Creando entidad...' : 'Crear'}
        </button>
    )
}


interface EntityPopupProps {
  onClose: () => void; // Function to close the popup
}

const EntityPopup: React.FC<EntityPopupProps> = ({ onClose }) => {
  const [state, action] = useFormState(createEntity, undefined);

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
        
      <div className="relative bg-white p-8 rounded-lg w-full max-w-md">
        <button
            className="absolute top-2 right-2"
            onClick={onClose}
        >
            ❌
        </button>
        <h1 className="text-2xl font-semibold mb-4">Crear entidad</h1>
        <form action={action}>
          <div className="space-y-3">
            <div>
              <AuthenticationFormLabel text="Nombre de la entidad" label="name" />
              <input
                className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm outline-none placeholder-gray-500"
                type="text"
                id="name"
                name="name"
                defaultValue=""
              />
            </div>
            {state?.errors?.name && (
              <div className="text-sm text-red-500">{state?.errors?.name.join(', ')}</div>
            )}
            <CreateButton />
          </div>
        </form>
      </div>
    </div>
  );
};

export default EntityPopup;
