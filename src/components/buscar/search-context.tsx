"use client"

import React, {createContext, useContext, useState, ReactNode} from "react";

type SearchState = {
    value: string
    searching: boolean
    kind: string
}[]

// Create a context
const SearchContext = createContext<{
    searchState: SearchState;
    setSearchState: React.Dispatch<React.SetStateAction<SearchState>>;
} | undefined>(undefined);

// Custom hook to use the SearchContext
const useSearchBase = () => {
    const context = useContext(SearchContext)
    if (!context) {
        throw new Error("useSearch must be used within a SearchContext");
    }
    return context;
}

// BarsProvider component to provide the context
export const SearchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [searchState, setSearchState] = useState([])

    return (
        <SearchContext.Provider value={{ searchState, setSearchState }}>
            {children}
        </SearchContext.Provider>
    )
}


export const useSearch = (kind: string) => {
    const {searchState, setSearchState} = useSearchBase()
    let stateForKind = searchState.find(x => x.kind == kind)

    return {
        searchState: {
            value: stateForKind?.value ?? "",
            searching: stateForKind?.searching ?? false
        },
        setSearchState: (state: {value: string, searching: boolean}) => {
            const i = searchState.findIndex(x => x.kind == kind)
            if(i != -1) {
                const newState = structuredClone(searchState)
                if(!state.searching){
                    newState[i] = {value: "", searching: false, kind}
                } else {
                    newState[i] = {...state, kind}
                }
                setSearchState(newState)
            } else {
                setSearchState([...structuredClone(searchState), {
                    kind,
                    ...state
                }])
            }
        }
    }
}