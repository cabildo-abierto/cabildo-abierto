import React, {ReactNode} from "react"
import {stopPropagation} from "@/utils/utils"

type ReactionButtonProps = {
    onClick: () => void
    count: ReactNode
    iconActive: ReactNode
    iconInactive?: ReactNode
    active?: boolean
    disabled?: boolean
    title?: string
    stopPropagation?: boolean
}

export const ReactionButton = ({
                                   onClick,
                                   count,
                                   iconActive,
                                   iconInactive,
                                   active = true,
                                   disabled = false,
                                   title,
                                   stopPropagation = true
                               }: ReactionButtonProps) => {
    return <div className={"text-[var(--text-light)]"}>
        <button
            className={"rounded-lg hover:bg-[var(--background-dark2)] py-1 px-1"}
            onClick={(e) => {
                if (stopPropagation) {
                    e.stopPropagation();
                    e.preventDefault();
                }
                onClick()
            }}
            disabled={disabled}
            title={title}
        >
            <div className={"flex items-baseline"}>
                {active ? <div>{iconActive}</div> : <div>{iconInactive}</div>}
                <div className="text-sm mr-1">{count}</div>
            </div>
        </button>
    </div>
}