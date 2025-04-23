import React, { ReactNode } from "react"
import { stopPropagation } from "@/utils/utils"

type ReactionButtonProps = {
    onClick: () => void
    count: ReactNode
    icon1: ReactNode
    icon2?: ReactNode
    active?: boolean
    disabled?: boolean
    title?: string
}

export const ReactionButton = ({
                                   onClick,
                                   count,
                                   icon1,
                                   icon2,
                                   active=true,
                                   disabled=false,
                                   title
}: ReactionButtonProps) => {
    
    return <div className={"text-[var(--text-light)]"}>
        <button
            className={"rounded-lg hover:bg-[var(--background-dark2)] py-1 px-1"}
            onClick={stopPropagation(onClick)}
            disabled={disabled}
            title={title}
        >
            <div className={"flex items-baseline"}>
                {active ? <div>{icon1}</div> : <div>{icon2}</div>}
                <div className="text-sm mr-1">{count}</div>
            </div>
        </button>
    </div>
}