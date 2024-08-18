"use client"

import { EntitySearchResult } from "./entity-search-result"
import { areArraysEqual } from "@mui/base"
import Link from "next/link"
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import { useEntities } from "@/app/hooks/entities"
import { ContentProps, EntityProps } from "@/app/lib/definitions";

function currentCategories(entity: EntityProps){
    return JSON.parse(entity.versions[entity.versions.length-1].categories)
}

function isPrefix(p: any[], q: any[]){
    if(p.length > q.length) return false
    return areArraysEqual(p, q.slice(0, p.length))
}

function getNextCategories(route: string[], entities: EntityProps[]){
    const nextCategories = new Set<string>()
    
    entities.forEach((entity: EntityProps) => {
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
    return "/nav/" + route.map(encodeURIComponent).join("/")
}

export type LoadingContent = {
    content: ContentProps,
    isLoading: boolean,
    isError: boolean
}

export const WikiCategories = ({route}: {route: string[]}) => {

    const {entities, isLoading, isError} = useEntities()
    /*const entityOrder = (a: EntityProps, b: EntityProps) => {
        const contentA = useContent(entityLastVersionId(a))
        const contentB = useContent(entityLastVersionId(b))

        return Number(contentA.content.text.length != 0) - Number(contentB.content.text.length != 0)
    }*/

    function entityInRoute(entity: EntityProps){
        const categories = currentCategories(entity)
        if(route.length == 0) return true
        if(!categories) return false // esto no debería pasar
        return categories.some((c: string[]) => {
            return isPrefix(route, c)
        })
    }

    /*const sortedEntities: {entity: EntityProps, content: LoadingContent}[] = []
    
    Object.values(entities).forEach((entity: EntityProps) => {
        if(entityInRoute(entity)){
            const content = useContent(entityLastVersionId(entity))
            sortedEntities.push({entity: entity, content: content})
        }
    })

    sortedEntities.sort((a, b) => (Number(a.content.content.text.length != 0) - Number(b.content.content.text.length != 0)))
    */


    if(isLoading){
        return <></>
    }
    if(!entities || isError){
        return <>Ocurrió un error :(</>
    }

    const nextCategories = getNextCategories(route, entities)

    const routeEntities = entities.filter(entityInRoute)

    return <>
        {nextCategories.size > 0 && <>
        <h2 className="flex justify-center py-4">{route.length == 0 ? "Categorías" : "Subcategorías"}</h2>
        <div className="flex justify-center">
            <div className="flex flex-wrap justify-center">
                {[...nextCategories].map((nextCategory: string, index: number) => {
                return <div className="p-1" key={index}>
                        <Link href={routeToUrl([...route, nextCategory])}>
                            <button className="search-result">
                                <div className="">
                                    <LibraryBooksIcon/>
                                    <div className="flex justify-center w-full">
                                        {nextCategory}
                                    </div>
                                </div>
                            </button>
                        </Link>
                    </div>
                })}
            </div>
        </div>
        </>}
        <h2 className="flex justify-center py-4">Artículos</h2>
        {entities.length > 0 ? 
        <div className="flex justify-center">
            <div className="flex flex-wrap justify-center">
                {routeEntities.map((entity, index) => (
                    <div key={index} className="p-1">
                        <EntitySearchResult entity={entity}/>
                    </div>
                ))}
            </div>
        </div> : <div className="flex justify-center">No hay artículos en esta categoría</div>}
    </>
}