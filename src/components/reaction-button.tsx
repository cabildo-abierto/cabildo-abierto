import { ReactNode } from "react"
import { stopPropagation } from "./utils"
import { Button, IconButton } from "@mui/material"

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
    
    return <IconButton
        onClick={stopPropagation(onClick)}
        disabled={disabled}
        title={title}
        size="small"
    >
        <div className={"flex items-end " + className + (active ? " toggled " : "")}>
            <span className={"px-[2px]"}>{active ? icon1 : icon2 }</span>
            <div className="flex justify-center">           
                <span className="text-xs">
                    {count}
                </span>  
            </div>
        </div>
    </IconButton>
}