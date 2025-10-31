import React, {useState} from "react";
import type {ReactNode} from "react";
import {BaseIconButton} from "../../layout/base/base-icon-button";
import {EngagementIconWithCounter} from "@/components/layout/utils/engagement-icon-with-counter";
import {BaseButtonProps} from "@/components/layout/base/baseButton";

type ReactionButtonProps = {
    onClick: () => void
    count: number
    iconActive: ReactNode
    iconInactive?: ReactNode
    active?: boolean
    disabled?: boolean
    title?: string
    stopPropagation?: boolean
    textClassName?: string
    hideZero?: boolean
    iconSize?: BaseButtonProps["size"]
}

export const ReactionButton = ({
                                   onClick,
                                   count,
                                   iconActive,
                                   iconInactive,
                                   active = true,
                                   disabled = false,
                                   title,
                                   iconSize,
                                   stopPropagation = true,
                                   textClassName,
                                   hideZero = false
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
            <BaseIconButton
                onClick={handleClick}
                title={title}
                size={iconSize}
            >
                <EngagementIconWithCounter
                    iconActive={iconActive}
                    iconInactive={iconInactive}
                    count={count}
                    active={active}
                    textClassName={textClassName}
                    hideZero={hideZero}
                />
            </BaseIconButton>
        </div>
    );
};
