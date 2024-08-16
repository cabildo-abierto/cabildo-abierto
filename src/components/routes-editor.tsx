"use client"

import { EntityProps } from "@/actions/get-entity"
import { useState } from "react"
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { areArraysEqual } from "@mui/base";
import StateButton from "./state-button";
import { updateCategories } from "@/actions/create-entity";
import { ContentProps } from "@/actions/get-content";
import { UserProps } from "@/actions/get-user";
import { entityLastVersionId } from "./utils";


function validCategories(categories: string[][]){
    return !categories.some((cat: string[]) => {return cat.length == 0})
}

type RouteEditorProps = {
    key: any
    category: string[],
    removeCategory: () => void,
    updateCategory: (a: string[]) => void
}

const RouteEditor = ({key, category, removeCategory, updateCategory}: 
    RouteEditorProps
) => {

    return <div className="flex items-center py-2" key={key}>
        <button className="flex items-center route-edit-btn" onClick={removeCategory}>
            <div className="px-1 py-1 flex items-center">
            <RemoveCircleOutlineIcon fontSize="small"/>
            </div>
        </button>
        <input
            className="border px-2 py-1 rounded outline-none w-64"
            placeholder={category[0]}
            value={category}
            onChange={(e) => {updateCategory([e.target.value])}}
        />
        <div className="ml-2">
        </div>
    </div>
}


const NewCategory = ({addCategory}: any) => {

    return <div className="flex items-center py-2">
        <button className="route-edit-btn" onClick={addCategory}>
            <div className="px-1 py-1 flex items-center">
                <AddCircleOutlineIcon fontSize="small"/>
            </div>
        </button>
    </div>
}


function areCategoriesEqual(cat1: string[][], cat2: string[][]){
    function comp(a: string[], b: string[]){
        console.log("a", a, "b", b, typeof(a), typeof(b))
        return areArraysEqual(a, b)
    }

    return areArraysEqual(cat1, cat2, comp)
}


export const RoutesEditor = ({entity, contents, user}: {entity: EntityProps, contents: Record<string, ContentProps>, user: UserProps}) => {
    const lastVersion = contents[entityLastVersionId(entity)]
    const entityCategories = lastVersion.categories ? JSON.parse(lastVersion.categories) : null
    const [categories, setCategories] = useState<string[][]>(entityCategories)

    if(!lastVersion || !lastVersion.categories){
        return <>Ocurrió un error</>
    }

    function addCategory() {
        setCategories([...categories, []])
    }

    const updateCategory = (i: number) => {
        return (newValue: string[]) => {
            setCategories([
                ...categories.slice(0, i),
                newValue,
                ...categories.slice(i+1)
            ])
        }
    }

    const removeCategory = (i: number) => {
        return () => {
            setCategories([
                ...categories.slice(0, i),
                ...categories.slice(i+1)
            ])
        }
    }

    return <div className="">
        <div className="py-3"><hr/></div>
        <div className="ml-1">
            <h3>Categorías</h3>
        </div>
        <div className="flex justify-center">
            <div className="w-72">
                {categories.length > 0 ? categories.map((cat: string[], i: number) => {
                    return <RouteEditor
                        key={i}
                        category={cat}
                        removeCategory={removeCategory(i)}
                        updateCategory={updateCategory(i)}
                    />
                }) : 
                <></>}
                <NewCategory
                    addCategory={addCategory}
                />
            </div>
        </div>
        <div className="flex justify-end">
            <button
                className="small-btn mr-2"
                disabled={areCategoriesEqual(categories, entityCategories)}
                onClick={() => {setCategories(entityCategories)}}>
                Cancelar
            </button>
            <StateButton
                className="small-btn"
                disabled={areCategoriesEqual(categories, entityCategories) || !validCategories(categories)}
                onClick={async () => {await updateCategories(entity.id, lastVersion.id, JSON.stringify(categories), user)}}
                text1="Confirmar"
                text2="Guardando..."
                reUsable={true}
            />
        </div>
        <div className="py-3"><hr/></div>
    </div>
}