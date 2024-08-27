import { ReactNode } from "react"
import { stopPropagation } from "./utils"

type ReactionButtonProps = {
    onClick: () => void
    count: ReactNode
    icon1: ReactNode
    icon2?: ReactNode
    active?: boolean
    disabled?: boolean
    title?: string
}

export const ReactionButton = ({onClick, count, icon1, icon2, active=true, disabled=false, title}: ReactionButtonProps) => {
    
    return <div className="" >
        <button onClick={stopPropagation(onClick)}
            disabled={disabled}
            className="reaction-btn"
            title={title}
        >
            <div className="flex items-end">
                <span className="px-[2px]">{active ? icon1 : icon2 }</span>
                <div className="w-2 flex justify-center">           
                    <span className="text-xs">
                        {count}
                    </span>  
                </div>
            </div>
        </button>
    </div>
}