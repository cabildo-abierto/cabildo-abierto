"use client"

import Link from "next/link"
import { SubcategoriesDropDown } from "./subcategories-dropdown";
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { getNextCategories } from "./utils";
import { ContentProps, SmallEntityProps } from "../app/lib/definitions";
import { useRouteEntities } from "../app/hooks/contents";
import { useRouter } from "next/navigation";


export type LoadingContent = {
    content: ContentProps
    isLoading: boolean
    isError: boolean
    routeEntities: SmallEntityProps[]
}


function routeUrl(route: string[]){
    return "/inicio/" + route.join("/")
}


const RouteElement = ({route, c, index, setRoute}: {route: string[], c: string, index: number, setRoute?: (v: string[]) => void}) => {
    const router = useRouter()

    if(setRoute){
        return <button className="text-2xl font-bold content text-[var(--primary)] hover:bg-[var(--secondary-light)] rounded px-2"
        onClick={() => {setRoute(route.slice(0, index))}}
    >
        {c}
    </button>
    } else {
        return <Link href={routeUrl(route.slice(0, index))}
        >
            <button 
                className="text-2xl font-bold content text-[var(--primary)] hover:bg-[var(--secondary-light)] rounded px-2"
            >
            {c}
        </button>
        </Link>
    }
}


export const Route = ({route, setRoute, selected}: {route: string[], setRoute?: (r: string[]) => void, selected?: string}) => {
    const routeEntities = useRouteEntities(route)
    const nextCategories = routeEntities.entities ? getNextCategories(route, routeEntities.entities) : null

    return <>
    <div className="flex items-center">
        {["Inicio"].concat(route).map((c: string, index: number) => {
            return <div className="flex items-center" key={index}>
            
                <RouteElement route={route} setRoute={setRoute} c={c} index={index}/>

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
        setRoute={setRoute}
        selected={selected}
    />}

    </>
}