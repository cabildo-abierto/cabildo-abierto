import React, { useState } from "react";
import type { ReactNode } from "react";

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
        <div className={"text-[var(--text-light)] " + (shake ? "animate-shake" : "")}>
            <button
                className="hover:bg-[var(--background-dark)] py-1 px-1"
                onClick={handleClick}
                title={title}
            >
                <div className="flex items-baseline">
                    {active ? <div>{iconActive}</div> : <div>{iconInactive}</div>}
                    <div className="text-sm mr-1">
                        {count}
                    </div>
                </div>
            </button>
        </div>
    );
};
