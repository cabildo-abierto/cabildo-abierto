"use client"

import React from "react"
import { ReactionButton } from "./reaction-button";
import { ViewsIcon } from "./icons/views-icon";


const title = "Cantidad de personas distintas que vieron este contenido. No se cuentan segundas visitas y tampoco personas sin cuenta."

export const ViewsCounter = ({
    content,
    disabled
}: {content: {uniqueViewsCount: number}, disabled?: boolean}) => {
    return <ReactionButton
        onClick={() => {}}
        icon1={<ViewsIcon/>}
        icon2={<ViewsIcon/>}
        disabled={disabled}
        active={false}
        count={content.uniqueViewsCount}
        title={title}
    />
}


export const TextViewsCounter = ({
    content
}: {content: {uniqueViewsCount: number}}) => {
    return <span title={title}>visto por {content.uniqueViewsCount}</span>
}