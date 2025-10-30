import Link from "next/link";
import {topicMentionsUrl, topicUrl} from "@/utils/uri";
import React from "react";
import {BaseButton} from "@/components/layout/base/baseButton";


export const TopicLinkButton = ({id}: {
    id: string
}) => {
    return <Link
        target={"_blank"}
        href={topicUrl(id, undefined, "normal")}
    >
        <BaseButton
            size={"small"}
            variant={"outlined"}
            className="px-1 py-[2px]"
        >
            Tema
        </BaseButton>
    </Link>
}


export const TopicMentionsLinkButton = ({id}: {
    id: string
}) => {

    return <Link
        target={"_blank"}
        href={topicMentionsUrl(id)}
    >
        <BaseButton
            size={"small"}
            variant={"outlined"}
            className="px-2 py-[2px]"
        >
            Menciones
        </BaseButton>
    </Link>
}