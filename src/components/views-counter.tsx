"use client"

import React from "react"
import { ReactionButton } from "./reaction-button";
import { useViews } from "src/app/hooks/contents";
import { ViewsIcon } from "./icons";

type ViewsCounterProps = {
    contentId: string
}

const title = "La cantidad de personas distintas que vieron este contenido. No se cuentan segundas visitas y tampoco personas sin cuenta."

export const ViewsCounter: React.FC<ViewsCounterProps> = ({
    contentId
}) => {
    const {views, isLoading, isError} = useViews(contentId)
    return <ReactionButton
        onClick={() => {}}
        icon1={<ViewsIcon/>}
        disabled={true}
        count={views === undefined ? "?" : views}
        title={title}
    />
}


export const TextViewsCounter: React.FC<ViewsCounterProps> = ({
    contentId
}) => {
    const {views, isLoading, isError} = useViews(contentId)
    return <span title={title}>visto por {views}</span>
}