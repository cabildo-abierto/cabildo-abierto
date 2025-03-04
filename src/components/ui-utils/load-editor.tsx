import ReadOnlyEditor from "../editor/read-only-editor";
import React, {ReactNode} from "react";


export const LoadEditor = ({children}: {children: ReactNode}) => {
    return <>
        {children}
        <div style={{display: "none"}}>
            <ReadOnlyEditor initialData={""}/>
        </div>
    </>
}