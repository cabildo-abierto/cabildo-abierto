"use client"

import { ContentProps } from "@/actions/get-content"
import { EntityProps } from "@/actions/get-entity"
import { EntitySearchResult } from "./entity-search-result"
import { areArraysEqual } from "@mui/base"
import Link from "next/link"
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';



export const WikiCategories = ({route, entities, contents}: {
    route: string[], 
    entities: Record<string, EntityProps>,
    contents: Record<string, ContentProps>}) => {
    
    const entityOrder = (a: EntityProps, b: EntityProps) => {
        return Number(contents[b.contentId].text.length != 0) - Number(contents[a.contentId].text.length != 0)
    }

    function isPrefix(p: any[], q: any[]){
        if(p.length > q.length) return false
        if(p.length == 0) return true
        return areArraysEqual(p.slice(0, q.length), q)
    }

    function entityInRoute(entity: EntityProps){
        const categories: string[][] = JSON.parse(entity.categories)
        return categories.some((c: string[]) => {
            return isPrefix(route, c)
        })
    }

    function routeToUrl(route: string[]){
        return "/nav/" + route.map(encodeURIComponent).join("/")
    }

    const sortedEntities = Object.values(entities).filter(entityInRoute).sort(entityOrder)

    const nextCategories = new Set<string>()
    
    Object.values(entities).forEach((entity: EntityProps) => {
        const categories: string[][] = JSON.parse(entity.categories)
        categories.forEach((category: string[]) => {
            if(isPrefix(route, category)){
                if(category.length > route.length){
                    nextCategories.add(category[route.length])
                }
            } else {
                console.log("Not a prefix", category, route)
            }
        })
    })

    return <>
        <h2 className="flex justify-center py-4">Subcategorías</h2>
        <div className="flex justify-center">
            <div className="flex flex-wrap justify-center">
            {nextCategories.size > 0 ? [...nextCategories].map((nextCategory: string, index: number) => {
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
            }) : <div className="flex justify-center">No hay subcategorías</div>}
            </div>
        </div>
        <h2 className="flex justify-center py-4">Artículos</h2>
        {sortedEntities.length > 0 ? 
        <div className="flex justify-center">
            <div className="flex flex-wrap justify-center">
                {sortedEntities.map((entity, index) => (
                    <div key={index} className="p-1">
                        <EntitySearchResult entity={entity} content={contents[entity.contentId]}/>
                    </div>
                ))}
            </div>
        </div> : <>No hay artículos en esta categoría</>}
    </>
}