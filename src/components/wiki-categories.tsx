"use client"

import { areArraysEqual } from "@mui/base"
import Link from "next/link"
import { useEntities } from "@/app/hooks/entities"
import { ContentProps, EntityProps, SmallEntityProps } from "@/app/lib/definitions";
import { useState } from "react";
import { SubcategoriesDropDown } from "./subcategories-dropdown";
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

function currentCategories(entity: {versions: {id: string, categories: string}[]}){
    return JSON.parse(entity.versions[entity.versions.length-1].categories)
}

export function isPrefix(p: any[], q: any[]){
    if(p.length > q.length) return false
    return areArraysEqual(p, q.slice(0, p.length))
}

export function getNextCategories(route: string[], entities: EntityProps[]){
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


export const Route = ({route, nextCategories, selected}: {route: string[], nextCategories?: Set<string>, selected?: string}) => {
    return <div className="flex items-center">
        {["Inicio"].concat(route).map((c: string, index: number) => {
            return <div className="flex items-center" key={index}>
            
                <Link className="text-2xl font-bold content text-[var(--primary)] hover:bg-[var(--secondary-light)] rounded px-2"
                    href={"/inicio/"+route.slice(0, index).join("/")+(selected ? "?selected="+selected : "")}
                    key={index}
                >
                    {c}
                </Link>

                {(index != route.length || (nextCategories && nextCategories.size > 0)) && 
                <span className="px-1 text-2xl font-bold content text-[var(--primary)] mb-1">
                    <KeyboardArrowRightIcon/>
                </span>}
            
            </div>
        })}
    </div>
}


export const WikiCategories = ({route, selected}: {route: string[], selected: string}) => {

    const {entities} = useEntities()
    const nextCategories = getNextCategories(route, entities)
    return <div className="">
        <div className="flex py-2 items-center px-2">
            <Route route={route} nextCategories={nextCategories} selected={selected}/>
            {nextCategories.size > 0 && 
            <SubcategoriesDropDown
                nextCategories={nextCategories}
                route={route}
                selected={selected}
            />}
        </div>
    </div>
}