"use client"
import { ReactNode, useState } from "react";
import { useSearch } from "./search-context";
import { RouteContent } from "./route-content";
import { ThreeColumnsLayout } from "./three-columns";
import { usePathname } from "next/navigation";


export const SearchPage = ({children}: {children: ReactNode}) => {
    const {searchValue} = useSearch()
    const path = usePathname()
    const [route, setRoute] = useState([])

    const showSearch = searchValue.length > 0 && !path.includes("/inicio")
    return <>
        {showSearch && 
        <ThreeColumnsLayout
            center={
                <RouteContent
                    setRoute={setRoute}
                    route={route}
                    showRoute={true}
                />
            }
        />}
        {!showSearch && children}
    </>
}