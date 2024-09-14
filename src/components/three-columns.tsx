import { ReactNode } from "react"

type ColumnsProps = {left?: ReactNode, center?: ReactNode, right?: ReactNode, centerWidth?: number}

export const ThreeColumnsLayout: React.FC<ColumnsProps> = (
    {left=null, center=null, right=null, centerWidth=800}) => {
    
    return <div className="flex justify-center">
        <div className="flex-1">
            {left}
        </div>
        <div className="max-w-[800px] w-full px-1">
            {center}
        </div>
        <div className="flex-1">
            {right}
        </div>
    </div>
}