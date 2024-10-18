"use client"

import { useState } from "react"
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { areArraysEqual } from "@mui/base";
import StateButton from "./state-button";
import { currentVersion, currentVersionContent, getNextCategories } from "./utils";
import { useSWRConfig } from "swr";
import LoadingSpinner from "./loading-spinner";
import { EntityCategoriesTitle } from "./categories";
import { updateEntity } from "../actions/entities";
import { useRouteEntities, useContent } from "../app/hooks/contents";
import { useUser } from "../app/hooks/user";
import { EntityProps } from "../app/lib/definitions";
import InfoPanel from "./info-panel";


function validSearchkey(k: string){
    return k.length > 0
}


function validSearchkeys(searchkeys: string[]){
    return !searchkeys.some((k: string) => (!validSearchkey(k)))}


const SearchKeyInput = ({
    update,
    searchkey,
    id,
  }: {
    update: (v: string) => void;
    searchkey: string;
    id: string
  }) => {
    return (
      <div>
        <input
          list={id}
          className={
            "border px-2 mx-1 py-1 rounded outline-none w-48 bg-[var(--background)] my-1"
          }
          placeholder={searchkey}
          value={searchkey}
          onChange={(e) => {
            update(e.target.value);
          }}
        />
      </div>
    );
};


type SearchkeysEditorProps = {
    searchkeys: string[],
    setSearchkeys: (a: string[]) => void
    routeIndex: number
}


function areSearchkeysEqual(cat1: string[], cat2: string[]){
    const result = areArraysEqual(cat1, cat2)
    return result
}


export const EntitySearchkeysTitle = ({name}: {name: string}) => {
    let info = "Se usan para contabilizar formas alternativas de mencionar el título a la hora de medir su popularidad."
    
    return <div className="ml-1 mb-4 flex items-center">
        <span className="mr-1 text-lg">Sinónimos de {name}</span>
        <InfoPanel text={info} className="w-96"/>
    </div>
}



export const SearchkeysEditor = ({entity, setEditing}: {entity: EntityProps, setEditing: (v: boolean) => void}) => {
    const user = useUser()
    const [searchkeys, setSearchkeys] = useState(entity.currentVersion.searchkeys)
    const {mutate} = useSWRConfig()

    const onSubmitSearchkeys = async () => {
        if(user.user) {
            const result = await updateEntity(entity.id, user.user.id, true, "", undefined, undefined, searchkeys)
            if(result){
                mutate("/api/entitiy/"+entity.id)
                mutate("/api/entities")
                setEditing(false)
                return false
            }
            return true
        }
        return false
    }

    function addSearchkey() {
        setSearchkeys([...searchkeys, ""])
    }

    const updateSearchkey = (i: number) => {
        return (value: string) => {
            setSearchkeys([
                ...searchkeys.slice(0, i),
                value,
                ...searchkeys.slice(i+1)
            ])
        }
    }

    const removeSearchkey = (i: number) => {
        return () => {
            setSearchkeys([
                ...searchkeys.slice(0, i),
                ...searchkeys.slice(i+1)
            ])
        }
    }


    return <div className="w-full">
        <hr className="py-3"/>
        <EntitySearchkeysTitle
            name={entity.name}
        />
        <div className="flex flex-col w-full">

            <div className="flex items-center py-2 flex-col">
                {searchkeys.map((c, i) => {
                    const id = i + " " + searchkeys.slice(0, i).join("/")
                    return <div key={i} className="flex items-start">
                        <div className="flex">
                            <SearchKeyInput
                                update={updateSearchkey(i)}
                                searchkey={c}
                                id={id}
                            />
                            <button onClick={removeSearchkey(i)}>
                                <RemoveCircleOutlineIcon fontSize="small"/>
                            </button>
                        </div>
                    </div>
                })}
                <button className="px-1 py-1" onClick={addSearchkey} title="Nuevo sinónimo">
                    <AddCircleOutlineIcon fontSize="small"/>
                </button>
            </div>
            
        </div>
        <div className="flex justify-end">
            <button
                className="small-btn mr-2"
                disabled={areSearchkeysEqual(searchkeys, entity.currentVersion.searchkeys)}
                onClick={() => {setSearchkeys(entity.currentVersion.searchkeys)}}>
                Cancelar
            </button>
            <StateButton
                className="small-btn"
                disabled={areSearchkeysEqual(searchkeys, entity.currentVersion.searchkeys) || !validSearchkeys(searchkeys)}
                handleClick={onSubmitSearchkeys}
                text1="Confirmar"
                text2="Guardando..."
            />
        </div>
        <div className="py-3"><hr/></div>
    </div>
}