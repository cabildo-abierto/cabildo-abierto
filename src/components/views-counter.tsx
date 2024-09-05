"use client"

import React from "react"
import { ReactionButton } from "./reaction-button";
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useViews } from "src/app/hooks/contents";
import LoadingSpinner from "./loading-spinner";

type ViewsCounterProps = {
    contentId: string
}

export const ViewsCounter: React.FC<ViewsCounterProps> = ({
    contentId
}) => {
    const {views, isLoading, isError} = useViews(contentId)
    return <ReactionButton
        onClick={() => {}}
        icon1={<VisibilityIcon fontSize="small"/>}
        disabled={true}
        count={views === undefined ? "?" : views}
        title="La cantidad de personas distintas que vieron este contenido. No se cuentan segundas vistas."
    />
}


export const TextViewsCounter: React.FC<ViewsCounterProps> = ({
    contentId
}) => {
    const {views, isLoading, isError} = useViews(contentId)
    return <span title="La cantidad de personas distintas que vieron este contenido, sin contar segundas vistas.">visto por {views}</span>
}