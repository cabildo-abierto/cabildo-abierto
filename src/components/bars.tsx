"use client"

import React, { ReactNode } from "react";

export const Bars = ({children}: {children: ReactNode}) => {
    return (
        <>
            {/*<Sidebar onClose={() => {}}/>*/}
            {children}
        </>
    );
};
