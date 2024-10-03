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
    routeIndex: number
}


const CategoryInput = ({
    isNew,
    update,
    category,
    availableCategories,
    id
  }: {
    isNew: boolean;
    update: (v: string) => void;
    category: string;
    availableCategories: string[]
    id: string
  }) => {
    return (
      <div>
        <input
          list={id}
          className={
            "border px-2 mx-1 py-1 rounded outline-none w-48 bg-[var(--background)] my-1" +
            (isNew ? " border-[var(--primary)] border-2" : " border-[var(--accent)]")
          }
          placeholder={category}
          value={category}
          onChange={(e) => {
            update(e.target.value);
          }}
        />
        <datalist id={id}>
          {availableCategories.map((cat, index) => {
            return (
            <option key={index} value={cat} />
          )})}
        </datalist>
      </div>
    );
};



const RouteEditor = ({category, removeCategory, updateCategory, routeIndex}: 
    RouteEditorProps
) => {
    const entities = useRouteEntities([])

    function updateCategoryAt(i: number, value: string){
        updateCategory([...category.slice(0, i), value, ...category.slice(i+1)])
    }

    let newIndex = 0
    if(!entities.isLoading){
        let next = getNextCategories(category.slice(0, newIndex), entities.entities)
        while(newIndex < category.length && next.some((c) => (c == category[newIndex]))){
            newIndex ++
            next = getNextCategories(category.slice(0, newIndex), entities.entities)
        }
    } else {
        return <LoadingSpinner/>
    }

    return <div className="flex items-center py-2 flex-wrap">
        <button className="flex items-center" onClick={removeCategory}
            title="Remover categoría"
        >
            <div className="px-1 py-1 flex items-center">
            <RemoveCircleOutlineIcon fontSize="small"/>
            </div>
        </button>
        {category.map((c, i) => {
            const isNew = i >= newIndex
            const next = getNextCategories(category.slice(0, i),entities.entities)
            const id = i + " " + routeIndex + " " + category.slice(0, i).join("/")
            return <div key={i}>
                <CategoryInput
                    isNew={isNew}
                    update={(v) => {updateCategoryAt(i, v)}}
                    category={c}
                    availableCategories={next}
                    id={id}
                />
            </div>
        })}
        <button className="px-1 py-1" onClick={() => {updateCategory(category.concat([""]))}} title="Nueva subcategoría">
            <AddCircleOutlineIcon fontSize="small"/>
        </button>
    </div>
}


const NewCategory = ({addCategory}: any) => {

    return <div className="flex items-center py-2">
        <button className="" onClick={addCategory} title="Nueva categoría">
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


export const RoutesEditor = ({entity, setEditing}: {entity: EntityProps, setEditing: (v: boolean) => void}) => {
    const user = useUser()
    const {content, isLoading} = useContent(currentVersionContent(entity).id)
    const entityCategories = (content && content.categories) ? JSON.parse(content.categories) : null
    const [categories, setCategories] = useState<string[][]>(entityCategories)
    const {mutate} = useSWRConfig()

    if(isLoading) return <LoadingSpinner/>
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
        // TO DO: Pedir confirmación si crea una nueva categoría
        // TO DO: Chequear que otro no haya editado en el medio
        if(user.user) {
            await updateEntity(entity.id, user.user.id, true, "", undefined, JSON.stringify(categories))
            mutate("/api/entitiy/"+entity.id)
            mutate("/api/entities")
            setEditing(false)
        }
        return false
    }

    return <div className="w-full">
        <hr className="py-3"/>
        <EntityCategoriesTitle
            name={entity.name}
            editing={true}
        />
        <div className="flex flex-col w-full">
            {categories.length > 0 ? categories.map((cat: string[], i: number) => {
                return <div key={i}>
                    <RouteEditor
                        category={cat}
                        removeCategory={removeCategory(i)}
                        updateCategory={updateCategory(i)}
                        routeIndex={i}
                    />
                </div>
            }) : 
            <></>}
            <NewCategory
                addCategory={addCategory}
            />
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
            />
        </div>
        <div className="py-3"><hr/></div>
    </div>
}