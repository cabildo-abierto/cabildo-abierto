import React, {ReactNode} from "react";


export const AdminSection = ({children, title}: {
    children: ReactNode
    title: string
}) => {
    return <div className={"space-y-4"}>
        <div className={"text-center text-sm"}>
            {title}
        </div>
        {children}
    </div>
}