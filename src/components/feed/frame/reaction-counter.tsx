import React, {ReactNode} from "react"
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


export const FixedCounter = ({count, icon, title}: {count: number, icon: ReactNode, title?: string}) => {
    
    return <div className={"text-[var(--text-light)]"}>
        <button
            className={"rounded-lg hover:bg-[var(--background-dark2)] py-1 px-1 flex items-end space-x-1"}
            title={title}
        >
            <div>{icon}</div>
            <div className="text-sm">{count}</div>
        </button>
    </div>
}