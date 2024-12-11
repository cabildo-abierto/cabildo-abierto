"use client"

import { useState } from "react"
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { areArraysEqual } from "@mui/base";
import StateButton from "./state-button";
import { useSWRConfig } from "swr";
import { useUser } from "../hooks/user";
import { TopicProps } from "../app/lib/definitions";
import InfoPanel from "./info-panel";
import Button from "@mui/material/Button";
import {getTopicTitle} from "./topic/utils";


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


function areSearchkeysEqual(cat1: string[], cat2: string[]){
    const result = areArraysEqual(cat1, cat2)
    return result
}


export const EntitySearchkeysTitle = ({name}: {name: string}) => {
    let info = <div className="flex flex-col">
        <span className="font-bold">Nombres alternativos para el título del tema</span>
        <span>Se usan para encontrar referencias a este tema en publicaciones, comentarios y otros temas.</span>
    </div>
    
    return <div className="ml-1 mb-4 flex items-center">
        <span className="mr-1 text-lg">Sinónimos de {name}</span>
        <InfoPanel text={info} className="w-96"/>
    </div>
}



export const SearchkeysEditor = ({entity, setEditing}: {entity: TopicProps, setEditing: (v: boolean) => void}) => {
    const user = useUser()
    const [searchkeys, setSearchkeys] = useState(entity.currentVersion.synonyms)
    const {mutate} = useSWRConfig()
    const [errorOnSave, setErrorOnSave] = useState(false)

    const onSubmitSearchkeys = async () => {
        /*setErrorOnSave(false)
        if(user.user) {
            const {error} = await updateEntityCategoriesOrSearchkeys(entity.id, user.user.id, true, "", undefined, searchkeys)
            if(!error){
                mutate("/api/entitiy/"+entity.id)
                mutate("/api/entities")
                setEditing(false)
            } else {
                setErrorOnSave(true)
            }
        }
        setErrorOnSave(true)*/
        return {}
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
            name={getTopicTitle(entity)}
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
        <div className="flex justify-end space-x-2">
            <Button
                size="small"
                variant="outlined"
                sx={{textTransform: "none"}}
                disabled={areSearchkeysEqual(searchkeys, entity.currentVersion.synonyms)}
                onClick={() => {setEditing(false)}}>
                Cancelar
            </Button>
            <StateButton
                size="small"
                variant="outlined"
                disabled={areSearchkeysEqual(searchkeys, entity.currentVersion.synonyms) || !validSearchkeys(searchkeys)}
                handleClick={onSubmitSearchkeys}
                text1="Confirmar"
            />
        </div>
        {errorOnSave && <div className="text-red-600 flex justify-end sm:text-sm text-xs mt-1">Ocurrió un error al guardar. Intentá de nuevo.</div>}
        <div className="py-3"><hr/></div>
    </div>
}