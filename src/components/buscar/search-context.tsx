"use client"

import React, { createContext, useContext, useState, ReactNode } from "react";

// Create a context
const SearchContext = createContext<{
    searchState: {value: string, searching: boolean};
    setSearchState: React.Dispatch<React.SetStateAction<{value: string, searching: boolean}>>;
} | undefined>(undefined);

// Custom hook to use the SearchContext
export const useSearch = () => {
    const context = useContext(SearchContext);
    if (!context) {
        throw new Error("useSearch must be used within a SearchContext");
    }
    return context;
};

// BarsProvider component to provide the context
export const SearchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [searchState, setSearchState] = useState({value: "", searching: false});

    return (
        <SearchContext.Provider value={{ searchState, setSearchState }}>
            {children}
        </SearchContext.Provider>
    );
};
