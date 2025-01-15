"use client"
import { usePathname, useParams } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { SearchContent } from "./search-content";
import { useSearch } from "./search/search-context";
import { ThreeColumnsLayout } from "./three-columns";


export const SearchPage = ({ children }: { children: ReactNode }) => {
    const { searchState, setSearchState } = useSearch();
    const path = usePathname();
    const params = useParams();
    const [route, setRoute] = useState([]);

    const [previousPath, setPreviousPath] = useState(path);
    const [previousParams, setPreviousParams] = useState(params);

    useEffect(() => {
        if (path !== previousPath || JSON.stringify(params) !== JSON.stringify(previousParams)) {
            setSearchState({value: "", searching: false});
            setPreviousPath(path);
            setPreviousParams(params);
        }
    }, [path, params])

    useEffect(() => {
        if (searchState.searching) {
            document.body.classList.add("no-scroll");
        } else {
            document.body.classList.remove("no-scroll");
        }

        // Clean up by removing the class when the component unmounts
        return () => document.body.classList.remove("no-scroll");
    }, [searchState])

    return (
        <>
            <div>
                {children}
            </div>

            {searchState.searching && (
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
