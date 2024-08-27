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
import FlagIcon from '@mui/icons-material/Flag';

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
            icon1={<FlagIcon fontSize="small" className="text-red-600"/>}
            count={count}
            disabled={false}
            title="Reportes de falsedad"
        />
    } else {
        return <></>
    }
}