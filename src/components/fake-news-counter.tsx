"use client"

import React from "react"
import { ReactionButton } from "./reaction-button";
import { RedFlag } from "./icons";
import { ContentProps } from "../app/lib/definitions";

type FakeCounterProps = {
    content: ContentProps
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
        title="Reportes de falsedad"
    />
}