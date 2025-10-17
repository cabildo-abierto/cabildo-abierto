"use client"
import {ReactNode} from "react";
import {smoothScrollTo} from "./scroll";


export const ScrollToButton = ({target=0, children}: {target?: any, children: ReactNode}) => {
    return <button onClick={() => {smoothScrollTo(target)}}>
        {children}
    </button>
}