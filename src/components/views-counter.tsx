"use client"

import React from "react"
import { ReactionButton } from "./reaction-button";
import { ViewsIcon } from "./icons";
import { ContentProps } from "../app/lib/definitions";

type ViewsCounterProps = {
    content: ContentProps
}

const title = "Cantidad de personas distintas que vieron este contenido. No se cuentan segundas visitas y tampoco personas sin cuenta."

export const ViewsCounter: React.FC<ViewsCounterProps> = ({
    content
}) => {
    return <ReactionButton
        onClick={() => {}}
        icon1={<ViewsIcon/>}
        icon2={<ViewsIcon/>}
        disabled={true}
        active={false}
        count={content.uniqueViewsCount}
        title={title}
    />
}


export const TextViewsCounter: React.FC<ViewsCounterProps> = ({
    content
}) => {
    return <span title={title}>visto por {content.uniqueViewsCount}</span>
}