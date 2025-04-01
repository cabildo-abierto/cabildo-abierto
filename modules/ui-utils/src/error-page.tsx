import React, { ReactNode } from "react"

export const ErrorPage: React.FC<{children: ReactNode}> = ({children}) => {
    const center = <div className="flex flex-col justify-center items-center mt-8">
        <h3>Error</h3>
        {children}
    </div>
    return center
}
