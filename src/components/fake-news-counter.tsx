"use client"

import React from "react"
import { ReactionButton } from "./reaction-button";
import { RedFlag } from "./icons";


type FakeCounterProps = {
    content: {
        fakeReportsCount: number
    }
    onClick?: () => void
}

export const FakeNewsCounter: React.FC<FakeCounterProps> = ({
    content,
    onClick
}) => {
    if(content.fakeReportsCount == 0){
        return <></>
    }
    return <ReactionButton
        onClick={onClick ? onClick : (() => {})}
        icon1={<RedFlag/>}
        count={content.fakeReportsCount}
        disabled={false}
        title="Reportes de información falsa"
    />
}


export const FixedFakeNewsCounter = ({
    count,
    onClick
}: {
    count: number,
    onClick?: () => void
}) => {
    return <ReactionButton
        onClick={onClick ? onClick : (() => {})}
        icon1={<RedFlag/>}
        count={count}
        disabled={false}
        title="Reportes de información falsa"
    />
}