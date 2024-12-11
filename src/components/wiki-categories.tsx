"use client"

import { CustomLink as Link } from './custom-link';
import { SubcategoriesDropDown } from "./subcategories-dropdown";
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { getNextCategories } from "./utils";
import { SmallTopicProps } from "../app/lib/definitions";
import { useRouteTopics } from "../hooks/contents";


function routeUrl(route: string[]){
    return "/inicio/" + route.join("/")
}


const RouteElement = ({route, c, index, setRoute}: {route: string[], c: string, index: number, setRoute?: (v: string[]) => void}) => {
    if(setRoute){
        return <button className="sm:text-lg text-base font-bold content text-[var(--primary)] hover:bg-[var(--secondary-light)] rounded px-2"
        onClick={() => {setRoute(route.slice(0, index))}}
    >
        {c}
    </button>
    } else {
        return <Link href={routeUrl(route.slice(0, index))}
        >
            <button 
                className="sm:text-lg text-base font-bold content text-[var(--primary)] hover:bg-[var(--secondary-light)] rounded px-2"
            >
                {c}
            </button>
        </Link>
    }
}


export const Route = ({route, setRoute, selected}: {route: string[], setRoute?: (r: string[]) => void, selected?: string}) => {
    const routeTopics = useRouteTopics(route)
    const nextCategories = routeTopics.topics ? getNextCategories(route, routeTopics.topics) : null

    return <div className="flex items-center flex-wrap">
        {route.map((c: string, index: number) => {
            return <div className="flex items-center" key={index}>
            
                <RouteElement route={route} setRoute={setRoute} c={c} index={index}/>

                {(index != route.length-1 || (nextCategories && nextCategories.length > 0 && setRoute != undefined)) && 
                <span className="px-1 text-2xl font-bold content text-[var(--primary)] mb-1">
                    <KeyboardArrowRightIcon/>
                </span>}
            </div>
        })}

        {nextCategories && nextCategories.length > 0 && setRoute != undefined && 
        <SubcategoriesDropDown
            nextCategories={nextCategories}
            route={route}
            setRoute={setRoute}
            selected={selected}
        />}

    </div>
}