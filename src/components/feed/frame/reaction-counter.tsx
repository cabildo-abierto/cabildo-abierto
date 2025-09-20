import React, {MouseEventHandler, ReactNode, useState} from "react"
import { ReactionButton } from "./reaction-button";
import { ActiveLikeIcon } from "../../icons/active-like-icon";
import { InactiveLikeIcon } from "../../icons/inactive-like-icon";

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
    disabled=false,
    iconActive=<ActiveLikeIcon/>,
    iconInactive=<InactiveLikeIcon/>,
    onAdd,
    onRemove,
    title,
    active,
    count
}: ReactionCounterProps) => {

    const onClick = async () => {
        if(!active){
            await onAdd()
        } else {
            await onRemove()
        }
    }
    
    return <ReactionButton
        onClick={onClick}
        active={active}
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
    disabled=false,
    stopPropagation=true
}: {
    count: number
    icon: ReactNode
    title?: string
    onClick: () => void
    disabled?: boolean
    stopPropagation?: boolean
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
    
    return <button
        onClick={handleClick}
        className={(shake ? "animate-shake" : "") + " text-[var(--text-light)] hover:bg-[var(--background-dark2)] py-[6px] px-1 flex items-end space-x-1"}
        title={title}
    >
        <div>{icon}</div>
        <div className="text-sm">{count}</div>
    </button>
}