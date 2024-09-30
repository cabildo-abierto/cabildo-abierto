"use client"
import { ReactNode } from "react";
import { useSearch } from "./search-context";
import { RouteContent } from "./route-content";
import { ThreeColumnsLayout } from "./three-columns";
import { usePathname } from "next/navigation";


export const SearchPage = ({children}: {children: ReactNode}) => {
    const {searchValue} = useSearch()
    const path = usePathname()

    if(searchValue.length > 0 && !path.includes("/inicio")){
        const center = <RouteContent route={[]} showRoute={true}/>

        return <ThreeColumnsLayout center={center}/>
    } else {
        return <>{children}</>
    }
}