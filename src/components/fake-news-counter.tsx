"use client"

import React from "react"
import { ReactionButton } from "./reaction-button";
import { RedFlag } from "./icons";
import { useFakeNewsCount } from "src/app/hooks/contents";

type FakeCounterProps = {
    contentId: string
    onClick?: () => void
}

export const FakeNewsCounter: React.FC<FakeCounterProps> = ({
    contentId,
    onClick
}) => {
    const {fakeNewsCount, isLoading} = useFakeNewsCount(contentId)
    if(isLoading || fakeNewsCount == 0)
        return <></>
    
    return <ReactionButton
        onClick={onClick ? onClick : (() => {})}
        icon1={<RedFlag/>}
        count={fakeNewsCount}
        disabled={false}
        title="Reportes de falsedad"
    />
}