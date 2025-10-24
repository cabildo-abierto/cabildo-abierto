import React, {useState} from "react";
import type {ReactNode} from "react";
import {Color} from "../../layout/utils/color";
import {IconButton} from "../../layout/utils/icon-button";

type ReactionButtonProps = {
    onClick: () => void
    count: number
    iconActive: ReactNode
    iconInactive?: ReactNode
    active?: boolean
    disabled?: boolean
    title?: string
    stopPropagation?: boolean
    hoverColor?: Color
    textClassName?: string
    hideZero?: boolean
}

export const ReactionButton = ({
                                   onClick,
                                   count,
                                   iconActive,
                                   iconInactive,
                                   active = true,
                                   disabled = false,
                                   title,
                                   hoverColor,
                                   stopPropagation = true,
                                   textClassName,
                                   hideZero=false
                               }: ReactionButtonProps) => {
    const [shake, setShake] = useState(false);

    const handleClick = (e: React.MouseEvent) => {
        if (stopPropagation) {
            e.stopPropagation();
            e.preventDefault();
        }

        if (disabled) {
            // Trigger shake animation
            setShake(true);
            setTimeout(() => setShake(false), 500); // Match animation duration
        } else {
            onClick();
        }
    };

    return (
        <div className={(shake ? "animate-shake" : "")}>
            <IconButton
                hoverColor={hoverColor}
                color={"transparent"}
                onClick={handleClick}
                title={title}
                size={"small"}
                sx={{borderRadius: 0}}
            >
                <div className="flex items-start space-x-1 text-[var(--text-light)]">
                    {active ? <div>{iconActive}</div> : <div>{iconInactive}</div>}
                    {(count > 0 || !hideZero) && <div className={textClassName}>
                        {count}
                    </div>}
                </div>
            </IconButton>
        </div>
    );
};
