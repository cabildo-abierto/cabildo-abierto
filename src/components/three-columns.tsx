import { ReactNode } from "react"

type ColumnsProps = {left?: ReactNode, center?: ReactNode, right?: ReactNode, centerWidth?: number}

export const ThreeColumnsLayout: React.FC<ColumnsProps> = (
    {left=null, center=null, right=null, centerWidth=800}) => {
    
    return <div className="flex justify-center">
        <div className="hidden lg:block lg:flex-1">
            {left}
        </div>
        <div className="w-full md:w-[700px] px-1">
            {center}
        </div>
        <div className="hidden lg:block lg:flex-1">
            {right}
        </div>
    </div>
}