"use client"

import Link from "next/link"
import { ContentProps } from "src/app/lib/definitions";
import { SubcategoriesDropDown } from "./subcategories-dropdown";
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { getNextCategories } from "./utils";
import { useRouteEntities } from "src/app/hooks/contents";


export type LoadingContent = {
    content: ContentProps,
    isLoading: boolean,
    isError: boolean
}


export const Route = ({route, selected}: {route: string[], selected?: string}) => {
    const entities = useRouteEntities(route)

    const nextCategories = entities.entities != null ? getNextCategories(route, entities.entities) : []

    return <><div className="flex items-center">
        {["Inicio"].concat(route).map((c: string, index: number) => {
            return <div className="flex items-center" key={index}>
            
                <Link className="text-2xl font-bold content text-[var(--primary)] hover:bg-[var(--secondary-light)] rounded px-2"
                    href={"/inicio/"+route.slice(0, index).join("/")+(selected ? "?selected="+selected : "")}
                    key={index}
                >
                    {c}
                </Link>

                {(index != route.length || (nextCategories && nextCategories.length > 0)) && 
                <span className="px-1 text-2xl font-bold content text-[var(--primary)] mb-1">
                    <KeyboardArrowRightIcon/>
                </span>}
            
            </div>
        })}
    </div>

    {nextCategories.length > 0 && 
    <SubcategoriesDropDown
        nextCategories={nextCategories}
        route={route}
        selected={selected}
    />}

    </>
}


export const WikiCategories = ({route, selected}: {route: string[], selected: string}) => {

    return <div className="flex flex-col">
        <span className="ml-2 text-sm text-[var(--text-light)]">Estás viendo:</span>
        <div className="flex pb-2 items-center px-2">
            <Route route={route} selected={selected}/>
        </div>
    </div>
    
    
}