import Link from "next/link";
import {topicMentionsUrl, topicUrl} from "@/utils/uri";
import React from "react";
import {Button, darker} from "@/components/layout/utils/button";
import { Color } from "@/components/layout/utils/color";


export const TopicLinkButton = ({id, backgroundColor="background"}: {
    id: string
    backgroundColor?: Color
}) => {
    return <Link
        target={"_blank"}
        href={topicUrl(id, undefined, "normal")}
    >
        <Button size={"small"} variant={"outlined"} color={darker(backgroundColor)} paddingX={0} paddingY={"2px"}>
            <span className={"text-xs"}>Tema</span>
        </Button>
    </Link>
}


export const TopicMentionsLinkButton = ({id, backgroundColor="background"}: {
    id: string
    backgroundColor?: Color
}) => {

    return <Link
        target={"_blank"}
        href={topicMentionsUrl(id)}
    >
        <Button size={"small"} variant={"outlined"} color={darker(backgroundColor)} paddingX={0} paddingY={"2px"}>
            <span className={"text-xs px-2"}>Menciones</span>
        </Button>
    </Link>
}