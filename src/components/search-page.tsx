"use client"

import { ReactNode, useState } from "react";
import { useSearch } from "./search-context";
import { SearchContent } from "./search-content";
import { ThreeColumnsLayout } from "./three-columns";
import { usePathname } from "next/navigation";


export const SearchPage = ({ children }: { children: ReactNode }) => {
    const { searchValue } = useSearch();
    const path = usePathname();
    const [route, setRoute] = useState([]);

    const showSearch = searchValue.length > 0;

    return (
        <>
            {/* Always render the children to maintain their state */}
            <div className="">
                {children}
            </div>

            {/* Conditionally render the search page with a lower z-index than the sidebar or modals */}
            {showSearch && (
                <div
                    style={{
                        position: 'absolute',
                        top: '3rem',
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'var(--background)', // Optional background
                        zIndex: 19, // Ensure this is lower than sidebar/modals
                        overflowY: 'auto',
                    }}
                >
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
