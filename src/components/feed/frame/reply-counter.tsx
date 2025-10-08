import React, {MouseEventHandler, ReactNode, useState} from "react"
import {Color} from "../../../../modules/ui-utils/src/color";
import { IconButton } from "../../../../modules/ui-utils/src/icon-button";


export const ReplyCounter = ({
                                 count,
                                 icon,
                                 title,
                                 onClick,
                                 disabled = false,
                                 stopPropagation = true,
                                 hoverColor,
    textClassName
                             }: {
    count: number
    icon: ReactNode
    title?: string
    onClick: () => void
    disabled?: boolean
    stopPropagation?: boolean
    hoverColor?: Color
    textClassName?: string
}) => {
    const [shake, setShake] = useState(false);

    const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
        if (stopPropagation) {
            e.stopPropagation();
            e.preventDefault();
        }

        if (disabled) {
            // Trigger shake animation
            setShake(true)
            setTimeout(() => setShake(false), 500)
        } else {
            onClick()
        }
    };

    return <div className={shake ? "animate-shake" : ""}>
        <IconButton
            hoverColor={hoverColor}
            onClick={handleClick}
            title={title}
            size={"small"}
            sx={{borderRadius: 0}}
            color={"transparent"}
        >
            <div
                className={"text-[var(--text-light)] flex items-start space-x-1"}
            >
                <div>{icon}</div>
                <div className={textClassName}>{count}</div>
            </div>
        </IconButton>
    </div>
}