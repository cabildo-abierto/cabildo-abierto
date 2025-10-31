import { TopicPage } from "@/components/topics/topic/topic-page"
import {Metadata} from "next";
import {createMetadata, mainMetadata} from "@/utils/metadata";
import {get} from "@/utils/fetch";
import {encodeParentheses} from "@/utils/uri";

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
    if(topicTitle.data){
        return createMetadata({
            title: topicTitle.data.title,
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
    return <TopicPage/>
}