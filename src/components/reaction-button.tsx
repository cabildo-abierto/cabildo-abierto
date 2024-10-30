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
    className?: string
}

export const ReactionButton = ({onClick, count, icon1, icon2, active=true, disabled=false, title, className="reaction-btn"}: ReactionButtonProps) => {
    
    return <div className="" title={title}>
        <button onClick={stopPropagation(onClick)}
            disabled={disabled}
            className={className + (active ? " toggled" : "")}
        >
            <div className="flex items-end">
                <span className="px-[2px]">{active ? icon1 : icon2 }</span>
                <div className="flex justify-center">           
                    <span className="text-xs">
                        {count}
                    </span>  
                </div>
            </div>
        </button>
    </div>
}