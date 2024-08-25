"use client"

import React, { ReactNode, useState } from "react"
import { addLike, removeLike } from "@/actions/likes";
import { stopPropagation } from "./utils";
import { ContentProps } from '@/app/lib/definitions';
import { useUser } from "@/app/hooks/user";
import { useSWRConfig } from "swr";
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import { ReactionButton } from "./reaction-button";
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useContent } from "@/app/hooks/contents";
import LoadingSpinner from "./loading-spinner";

type ViewsCounterProps = {
    contentId: string
}

export const ViewsCounter: React.FC<ViewsCounterProps> = ({
    contentId
}) => {
    const {content, isLoading} = useContent(contentId)
    if(isLoading) return <LoadingSpinner/>

    return <ReactionButton
        onClick={() => {}}
        icon1={<VisibilityIcon fontSize="small"/>}
        disabled={true}
        count={content._count.views}
    />
}