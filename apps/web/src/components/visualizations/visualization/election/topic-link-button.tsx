import Link from "next/link";
import React from "react";
import {BaseButton} from "@/components/utils/base/base-button";
import {topicMentionsUrl, topicUrl} from "@/components/utils/react/url";


export const TopicLinkButton = ({id}: {
    id: string
}) => {
    return <Link
        target={"_blank"}
        href={topicUrl(id)}
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