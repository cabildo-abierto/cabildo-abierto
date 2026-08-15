import {Metadata} from "next";
import {encodeParentheses} from "@cabildo-abierto/utils";
import {get} from "@/components/utils/react/fetch";
import {createMetadata, mainMetadata} from "@/utils/metadata";
import { NewTopicPage } from "@/components/v2/new-topic-page";

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
    { searchParams }: Props
): Promise<Metadata> {
    const p = await searchParams
    const i = p?.i instanceof Array ? p?.i[0] : p?.i
    const enc = encodeParentheses(encodeURIComponent(i))
    const topicTitle = await get<{title: string}>(`/topic-title/${enc}`)
    if(topicTitle.success === true){
        return createMetadata({
            title: topicTitle.value.title,
            description: "Tema de discusión en Cabildo Abierto."
        })
    } else if(i){
        return createMetadata({
            title: i,
            description: "Tema de discusión en Cabildo Abierto."
        })
    } else {
        return mainMetadata
    }
}

export default async function Page() {
    return <NewTopicPage/>
}