import { ReactNode } from "react"
import { ThreeColumnsLayout } from "./main-layout"

export const ErrorPage: React.FC<{children: ReactNode}> = ({children}) => {
    const center = <div className="flex justify-center">
        <h3>Error</h3>
        {children}
    </div>
    return <ThreeColumnsLayout center={center}/>
}
