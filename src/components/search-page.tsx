"use client";

import { ReactNode, useEffect, useState } from "react";
import { useSearch } from "./search-context";
import { SearchContent } from "./search-content";
import { ThreeColumnsLayout } from "./three-columns";
import { usePathname } from "next/navigation";


export const SearchPage = ({ children }: { children: ReactNode }) => {
    const { searchValue } = useSearch();
    const path = usePathname();
    const [route, setRoute] = useState([]);
    
    const showSearch = searchValue.length > 0 && !path.includes("/temas");

    return (
        <>
            {/* Always render the children to maintain their state */}
            <div>
                {children}
            </div>

            {showSearch && (
                <div className="fixed top-[3rem] left-0 bg-[var(--background)] z-50 w-screen">
                    <ThreeColumnsLayout
                        center={
                            <SearchContent
                                setRoute={setRoute}
                                route={route}
                                showRoute={true}
                            />
                        }
                    />
                </div>
            )}
        </>
    );
};
