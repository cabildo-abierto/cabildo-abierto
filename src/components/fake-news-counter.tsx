"use client"

import React from "react"
import { ReactionButton } from "./reaction-button";
import { RedFlag } from "./icons";


type FakeCounterProps = {
    content: {
        childrenContents: {type: string}[]
    }
    onClick?: () => void
}

export const FakeNewsCounter: React.FC<FakeCounterProps> = ({
    content,
    onClick
}) => {
    let count = 0
    content.childrenContents.forEach((c) => {
        if(c.type == "FakeNewsReport") count ++
    })

    if(count == 0) return <></>

    return <ReactionButton
        onClick={onClick ? onClick : (() => {})}
        icon1={<RedFlag/>}
        count={count}
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
        icon1={<div className="mb-1"><RedFlag fontSize="inherit"/></div>}
        count={count}
        disabled={false}
        title="Reportes de información falsa"
    />
}