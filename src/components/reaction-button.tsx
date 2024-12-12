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
    
    return <div className={"text-[var(--text-light)]"}>
        <button
            className={"rounded-lg hover:bg-[var(--background-dark)] px-1"}
            onClick={stopPropagation(onClick)}
            disabled={disabled}
            title={title}
        >
            <div className={"flex items-center"}>
                {active ? <div className={(active ? "text-red-400" : "")}>{icon1}</div> : <div>{icon2}</div>} <div className="text-sm flex items-end">{count}</div>
            </div>
        </button>
    </div>
}