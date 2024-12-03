"use client"

import { ReactionButton } from "./reaction-button";
import { RedFlag } from "./icons/red-flag-icon";


export const FixedFakeNewsCounter = ({
    count,
    onClick
}: {
    count: number,
    onClick?: () => void
}) => {
    return <ReactionButton
        onClick={onClick ? onClick : (() => {})}
        icon1={<div className="mb-1"><RedFlag fontSize="inherit"/></div>}
        count={count}
        disabled={false}
        title="Reportes de información falsa"
    />
}