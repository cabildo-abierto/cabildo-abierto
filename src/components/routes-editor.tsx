"use client"

import { useState } from "react"
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { areArraysEqual } from "@mui/base";
import StateButton from "./state-button";
import { entityLastVersionId } from "./utils";
import { useContent } from "@/app/hooks/contents";
import { updateEntity } from "@/actions/create-entity";
import { EntityProps } from "@/app/lib/definitions";
import { useUser } from "@/app/hooks/user";
import { useSWRConfig } from "swr";

function validCategoryElement(e: string){
    return e.length > 0
}

function validCategory(category: string[]){
    return category.length > 0 && !category.some((e) => !validCategoryElement(e))
}


function validCategories(categories: string[][]){
    return !categories.some((cat: string[]) => (!validCategory(cat)))
}

type RouteEditorProps = {
    category: string[],
    removeCategory: () => void,
    updateCategory: (a: string[]) => void
}

const RouteEditor = ({category, removeCategory, updateCategory}: 
    RouteEditorProps
) => {

    function updateCategoryAt(i: number, value: string){
        updateCategory([...category.slice(0, i), value, ...category.slice(i+1)])
    }

    return <div className="flex items-center py-2">
        <button className="flex items-center route-edit-btn" onClick={removeCategory}>
            <div className="px-1 py-1 flex items-center">
            <RemoveCircleOutlineIcon fontSize="small"/>
            </div>
        </button>
        <div className="flex">
            {category.map((c, i) => {
                return <input
                    key={i}
                    className="border px-2 mx-1 py-1 rounded outline-none w-48"
                    placeholder={c}
                    value={c}
                    onChange={(e) => {updateCategoryAt(i, e.target.value)}}
                />
            })}
            <button className="route-edit-btn px-1 py-1" onClick={() => {updateCategory(category.concat([""]))}}>
                <AddCircleOutlineIcon fontSize="small"/>
            </button>
        </div>
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
        return areArraysEqual(a, b)
    }

    const result = areArraysEqual(cat1, cat2, comp)
    return result
}


export const RoutesEditor = ({entity}: {entity: EntityProps}) => {
    const user = useUser()
    const {content, isLoading, isError} = useContent(entityLastVersionId(entity))
    const entityCategories = content.categories ? JSON.parse(content.categories) : null
    const [categories, setCategories] = useState<string[][]>(entityCategories)
    const {mutate} = useSWRConfig()

    if(!content || !content.categories){
        return <>Ocurrió un error</>
    }

    function addCategory() {
        setCategories([...categories, [""]])
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

    const onSubmitCategories = async () => {
        if(user.user) {
            await updateEntity(content.text, JSON.stringify(categories), entity.id, user.user)
            mutate("/api/entitiy/"+entity.id)
            mutate("/api/entities")
        }
    }

    return <div className="">
        <div className="py-3"><hr/></div>
        <div className="ml-1">
            <h3>Categorías</h3>
        </div>
        <div className="flex">
            <div className="w-72">
                {categories.length > 0 ? categories.map((cat: string[], i: number) => {
                    return <div key={i}><RouteEditor
                        category={cat}
                        removeCategory={removeCategory(i)}
                        updateCategory={updateCategory(i)}
                    /></div>
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
                onClick={onSubmitCategories}
                text1="Confirmar"
                text2="Guardando..."
                reUsable={true}
            />
        </div>
        <div className="py-3"><hr/></div>
    </div>
}