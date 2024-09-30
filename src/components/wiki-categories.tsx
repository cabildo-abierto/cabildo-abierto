"use client"

import Link from "next/link"
import { SubcategoriesDropDown } from "./subcategories-dropdown";
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { getNextCategories } from "./utils";
import { ContentProps, SmallEntityProps } from "../app/lib/definitions";
import { useRouteEntities } from "../app/hooks/contents";


export type LoadingContent = {
    content: ContentProps
    isLoading: boolean
    isError: boolean
    routeEntities: SmallEntityProps[]
}


export const Route = ({route, selected}: {route: string[], selected?: string}) => {
    const routeEntities = useRouteEntities(route)
    const nextCategories = routeEntities.entities ? getNextCategories(route, routeEntities.entities) : null

    return <>
    <div className="flex items-center">
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

    {nextCategories && nextCategories.length > 0 && 
    <SubcategoriesDropDown
        nextCategories={nextCategories}
        route={route}
        selected={selected}
    />}

    </>
}