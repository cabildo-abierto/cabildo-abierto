"use client"

import React, { createContext, useContext, useState, ReactNode } from "react";

// Create a context
const SearchContext = createContext<{
    searchValue: string;
    setSearchValue: React.Dispatch<React.SetStateAction<string>>;
} | undefined>(undefined);

// Custom hook to use the SearchContext
export const useSearch = () => {
    const context = useContext(SearchContext);
    if (!context) {
        throw new Error("useSearch must be used within a BarsProvider");
    }
    return context;
};

// BarsProvider component to provide the context
export const SearchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [searchValue, setSearchValue] = useState("");

    return (
        <SearchContext.Provider value={{ searchValue, setSearchValue }}>
            {children}
        </SearchContext.Provider>
    );
};
