import React, {MouseEventHandler, ReactNode, useState} from "react"
import {ReactionButton} from "./reaction-button";
import {ActiveLikeIcon} from "@/components/layout/icons/active-like-icon";
import {InactiveLikeIcon} from "@/components/layout/icons/inactive-like-icon";
import {Color} from "../../../../modules/ui-utils/src/color";
import { IconButton } from "../../../../modules/ui-utils/src/icon-button";

type ReactionCounterProps = {
    disabled?: boolean
    iconActive?: ReactNode
    iconInactive?: ReactNode
    title?: string
    onAdd: () => Promise<void>
    onRemove: () => Promise<void>
    active: boolean
    count: number
}


export const ReactionCounter = ({
                                    disabled = false,
                                    iconActive = <ActiveLikeIcon/>,
                                    iconInactive = <InactiveLikeIcon/>,
                                    onAdd,
                                    onRemove,
                                    title,
                                    active,
                                    count
                                }: ReactionCounterProps) => {

    const onClick = async () => {
        if (!active) {
            await onAdd()
        } else {
            await onRemove()
        }
    }

    return <ReactionButton
        onClick={onClick}
        active={active}
        hoverColor={"background-dark3"}
        iconActive={iconActive}
        iconInactive={iconInactive}
        disabled={disabled}
        count={count}
        title={title}
    />
}


export const FixedCounter = ({
                                 count,
                                 icon,
                                 title,
                                 onClick,
                                 disabled = false,
                                 stopPropagation = true,
                                 hoverColor
                             }: {
    count: number
    icon: ReactNode
    title?: string
    onClick: () => void
    disabled?: boolean
    stopPropagation?: boolean
    hoverColor?: Color
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
                className={"text-[var(--text-light)] flex items-end space-x-1"}
            >
                <div>{icon}</div>
                <div className="text-sm">{count}</div>
            </div>
        </IconButton>
    </div>
}