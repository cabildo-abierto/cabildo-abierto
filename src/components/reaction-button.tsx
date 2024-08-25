import { ReactNode } from "react"
import { stopPropagation } from "./utils"

type ReactionButtonProps = {
    onClick: () => void
    count: number
    icon1: ReactNode
    icon2?: ReactNode
    active?: boolean
    disabled?: boolean
}

export const ReactionButton = ({onClick, count, icon1, icon2, active=true, disabled=false}: ReactionButtonProps) => {
    
    return <div className="" >
        <button onClick={stopPropagation(onClick)}
            disabled={disabled}
            className="reaction-btn"
        >
            <div className="flex items-end">
                <span className="px-[2px]">{active ? icon1 : icon2 }</span>
                <div className="w-2 flex justify-center">           
                <span className="text-xs">{count}</span>  
                </div>
            </div>
        </button>
    </div>
}