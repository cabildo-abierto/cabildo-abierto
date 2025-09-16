"use client"

import React, { createContext, useContext, useState, ReactNode } from "react";


export type TopbarState = {}


const TopbarContext = createContext<{
    topbarState: TopbarState;
    setTopbarState: React.Dispatch<React.SetStateAction<TopbarState>>;
} | undefined>(undefined)


export const useTopbarState = () => {
    const context = useContext(TopbarContext);
    if (!context) {
        throw new Error("useTopbarState must be used within a TopbarContext");
    }
    return context;
};


export const TopbarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [topbarState, setTopbarState] = useState<TopbarState>({});

    return (
        <TopbarContext.Provider value={{ topbarState, setTopbarState }}>
            {children}
        </TopbarContext.Provider>
    );
};
