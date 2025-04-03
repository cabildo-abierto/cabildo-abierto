import ReadOnlyEditor from "@/components/editor/read-only-editor";
import React, {ReactNode} from "react";


export const LoadEditor = ({children}: {children: ReactNode}) => {
    return <>
        {children}
        <div style={{display: "none"}}>
            <ReadOnlyEditor text={""} format={"plain-text"}/>
        </div>
    </>
}