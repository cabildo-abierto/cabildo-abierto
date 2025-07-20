import { TopicPage } from "@/components/topics/topic/topic-page"
import {Metadata} from "next";
import {produce} from "immer";
import {mainMetadata} from "@/utils/metadata";
import {get} from "@/utils/fetch";
import {encodeParentheses} from "@/utils/uri";

type Props = {
    params: Promise<{ id: string }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
    { params, searchParams }: Props
): Promise<Metadata> {
    const p = await searchParams
    const i = p?.i instanceof Array ? p?.i[0] : p?.i
    const enc = encodeParentheses(encodeURIComponent(i))
    const topicTitle = await get<{title: string}>(`/topic-title/${enc}`)
    if(topicTitle.data){
        return produce(mainMetadata, draft => {
            draft.title = `${topicTitle.data.title} - Tema en Cabildo Abierto`
        })
    } else if(i){
        return produce(mainMetadata, draft => {
            draft.title = `${i} - Tema en Cabildo Abierto`
        })
    } else {
        return mainMetadata
    }
}

export default async function Page(
    { params, searchParams }: Props
) {
    const p = await searchParams
    const i = p?.i
    if(!i || typeof i != "string") {
        const did = p?.did
        const rkey = p?.rkey
        if(typeof did == "string" && typeof rkey == "string"){
            return <TopicPage did={did} rkey={rkey}/>
        } else {
            return null
        }
    }

    return <TopicPage
        topicId={i}
    />
}