"use client"

import React, { useState } from 'react';
import { createEntity } from '@/actions/create-entity';
import { useRouter } from 'next/navigation';
import Popup from './popup';
import NeedSubscriptionPopupPanel from './need-subscription-popup';
import { validSubscription } from './utils';
import NeedAccountPopupPanel from './need-account-popup';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import { useUser } from '@/app/hooks/user';
import { useSWRConfig } from 'swr';
import StateButton from './state-button';


export function validEntityName(name: string) {
    return name.length >= 2 && name.length < 100
}

type PanelProps = {
  onClose: () => {}
}


const ValidPanel: React.FC<PanelProps> = ({onClose}) => { 
  const user = useUser()
  const [entityName, setEntityName] = useState("")
  const {mutate} = useSWRConfig()
  const router = useRouter()
  return <>
      <div className="space-y-3">
          <h3>Nuevo artículo colaborativo</h3>
          <div>
              <input
                className="w-full rounded-md border border-gray-200 py-2 px-3 text-sm outline-none placeholder-gray-500"
                value={entityName}
                onChange={(e) => {setEntityName(e.target.value)}}
                placeholder="Título"
              />
          </div>
          <div className="py-4">
              <StateButton
                  onClick={async () => {
                      if(user.user){
                          const newEntity = await createEntity(entityName, user.user.id)
                          mutate("api/entities")
                          router.push("/articulo/"+newEntity.id)
                      }
                  }}
                  disabled={!validEntityName(entityName)}
                  className="gray-btn w-full"
                  text1="Crear"
                  text2="Creando..."
              />
          </div>
      </div>
</>}


export default function EntityPopup() {
    const user = useUser()

    if(user.isLoading){
      return <></>
    }

    

    const trigger = ({onClick}: any) => {
        return <button
            className="gray-btn w-64 flex justify-center items-center"
            onClick={onClick}
        >
          <span className="px-1"><LocalLibraryIcon/></span> Artículo colaborativo
        </button>
    }

    let panel: React.FC<PanelProps> | null = null

    if(!user.user){
        panel = NeedAccountPopupPanel
    } else if(!validSubscription(user.user)){
        panel = NeedSubscriptionPopupPanel
    } else {
        panel = ValidPanel
    }

    return <Popup Panel={panel} Trigger={trigger}/>
}
