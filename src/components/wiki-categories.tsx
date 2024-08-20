"use client"

import { areArraysEqual } from "@mui/base"
import Link from "next/link"
import { useEntities } from "@/app/hooks/entities"
import { ContentProps, EntityProps, SmallEntityProps } from "@/app/lib/definitions";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useState } from "react";

function currentCategories(entity: {versions: {id: string, categories: string}[]}){
    return JSON.parse(entity.versions[entity.versions.length-1].categories)
}

function isPrefix(p: any[], q: any[]){
    if(p.length > q.length) return false
    return areArraysEqual(p, q.slice(0, p.length))
}

function getNextCategories(route: string[], entities: EntityProps[]){
    const nextCategories = new Set<string>()
    
    entities.forEach((entity: SmallEntityProps) => {
        const categories: string[][] = currentCategories(entity)
        if(!categories) return
        categories.forEach((category: string[]) => {
            if(isPrefix(route, category)){
                if(category.length > route.length){
                    nextCategories.add(category[route.length])
                }
            }
        })
    })

    return nextCategories
}

function routeToUrl(route: string[]){
    return "/inicio/" + route.map(encodeURIComponent).join("/")
}

export type LoadingContent = {
    content: ContentProps,
    isLoading: boolean,
    isError: boolean
}

export function entityInRoute(entity: {versions: {id: string, categories: string}[]}, route: string[]){
    const categories = currentCategories(entity)
    if(route.length == 0) return true
    if(!categories) return false // esto no debería pasar
    return categories.some((c: string[]) => {
        return isPrefix(route, c)
    })
}

const SubcategoriesDropDown = ({nextCategories, route}: {nextCategories: Set<string>, route: string[]}) => {
    const [viewSubcategories, setViewSubcategories] = useState(false);
    return (
        <div className="relative ml-2"> {/* Make the parent div relative */}
            <button className="subcategories-dropdown px-1" onClick={() => setViewSubcategories(!viewSubcategories)}>
                Subcategoría <ArrowDropDownIcon/>
            </button>
            {viewSubcategories && (
                nextCategories.size > 0 ?
                <div className="w-full absolute top-full mt-2 left-0 z-10"> {/* Position the dropdown absolutely */}
                    {[...nextCategories].map((nextCategory: string, index: number) => {
                        return (
                            <div className="" key={index}>
                                <Link href={routeToUrl([...route, nextCategory])}>
                                    <button className="subcategories-dropdown w-full bg-white py-1 mt-1">
                                        <div className="flex justify-center w-full">
                                            {nextCategory}
                                        </div>
                                    </button>
                                </Link>
                            </div>
                        );
                    })}
                </div> : <div className="w-full absolute top-full mt-2 px-1 left-0 z-10"> {/* Position the dropdown absolutely */}
                    <div className="bg-white border border-[var(--accent)] rounded px-1">No hay subcategorías</div>
                </div>
            )}
        </div>
    );
};


const Route = ({route, nextCategories}: {route: string[], nextCategories: Set<string>}) => {
    return <>
        {["Inicio"].concat(route).map((c: string, index: number) => {
            return <><Link className="text-2xl bodoni text-[var(--primary)] hover:bg-[var(--secondary-light)] rounded px-2"
                href={"/inicio/"+route.slice(0, index).join("/")}
            >
                {c}
            </Link>
                {(index != route.length || nextCategories.size > 0) && <span className="px-1 text-2xl bodoni text-[var(--primary)]">{">"}</span>}
            </>
        })}
    </>
}


export const WikiCategories = ({route}: {route: string[]}) => {

    const {entities} = useEntities()
    const nextCategories = getNextCategories(route, entities)
    return <div className="categories-panel mt-8 mx-2">
        <div className="px-2 py-2">
            <div className="flex py-2 items-center">
                <Route route={route} nextCategories={nextCategories}/>
                {nextCategories.size > 0 && <SubcategoriesDropDown nextCategories={nextCategories} route={route}/>}
            </div>
        </div>
    </div>
}