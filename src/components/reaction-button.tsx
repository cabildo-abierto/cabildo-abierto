import React, { ReactNode } from "react"
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
    
    return <div className={"text-[var(--text-light)]"}><IconButton
        onClick={stopPropagation(onClick)}
        disabled={disabled}
        title={title}
        color={"inherit"}
    >
        {active ? icon1 : icon2} <span className="text-sm flex items-end">{count}</span>
    </IconButton></div>
}