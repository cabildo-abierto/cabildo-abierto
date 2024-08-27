"use client"

import React from "react"
import { ReactionButton } from "./reaction-button";
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useViews } from "@/app/hooks/contents";
import LoadingSpinner from "./loading-spinner";

type ViewsCounterProps = {
    contentId: string
}

export const ViewsCounter: React.FC<ViewsCounterProps> = ({
    contentId
}) => {
    const {views, isLoading} = useViews(contentId)

    return <ReactionButton
        onClick={() => {}}
        icon1={<VisibilityIcon fontSize="small"/>}
        disabled={true}
        count={isLoading ? "?" : views}
    />
}