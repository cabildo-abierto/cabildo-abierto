"use client"

import React, { useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { createEntityFromForm } from '@/actions/create-entity';
import { useRouter } from 'next/navigation';
import Popup from './popup';
import NeedSubscriptionPopupPanel from './need-subscription-popup';
import { validSubscription } from './utils';
import NeedAccountPopupPanel from './need-account-popup';
import { UserProps } from '@/actions/get-user';
import ArticleIcon from '@mui/icons-material/Article';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';


export default function EntityPopup({user}: {user?: UserProps}) {
    const [state, action] = useFormState(createEntityFromForm, null);
    const router = useRouter()

    useEffect(() => {
        if(state && !state.error){
          router.push("/articulo/"+state.id)
        }
    }, [state, router])

    const ValidPanel: React.FC<any> = ({onClose}) => { return <>
        <form action={action}>
            <div className="space-y-3">
              <h3>Nuevo artículo</h3>
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

    const trigger = ({onClick}: any) => {
        return <button
          className="gray-btn w-64 flex justify-center items-center"
          onClick={onClick}>
          <span className="px-1"><LocalLibraryIcon/></span> Artículo colaborativo
      </button>
    }

    let panel: React.FC<any> | null = null

    if(user === null){
        panel = NeedAccountPopupPanel
    } else if(!validSubscription(user)){
        panel = NeedSubscriptionPopupPanel
    } else {
        panel = ValidPanel
    }

    return <Popup Panel={panel} Trigger={trigger}/>
}


export function CreateButton() {
    const {pending} = useFormStatus()

    return (
        <button aria-disabled={pending} type="submit" className="gray-btn w-full">
            {pending ? 'Creando artículo...' : 'Crear'}
        </button>
    )
}
