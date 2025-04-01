"use client"
import {smoothScrollTo} from "../../ca-lexical-editor/src/plugins/TableOfContentsPlugin";
import {ReactNode} from "react";


export const ScrollToButton = ({target=0, children}: {target?: any, children: ReactNode}) => {
    return <button onClick={() => {smoothScrollTo(target)}}>
        {children}
    </button>
}