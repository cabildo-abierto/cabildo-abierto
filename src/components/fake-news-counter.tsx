"use client"

import React from "react"
import { ReactionButton } from "./reaction-button";
import { RedFlag } from "./icons";

type FakeCounterProps = {
    count: number
    onClick?: () => void
}


export const FakeNewsCounter: React.FC<FakeCounterProps> = ({
    count,
    onClick
}) => {
    if(count > 0){
        return <ReactionButton
            onClick={onClick ? onClick : (() => {})}
            icon1={<RedFlag/>}
            count={count}
            disabled={false}
            title="Reportes de falsedad"
        />
    } else {
        return <></>
    }
}