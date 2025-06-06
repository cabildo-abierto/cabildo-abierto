import { TopicPage } from "@/components/topics/topic/topic-page"
import {Metadata} from "next";
import {produce} from "immer";
import {mainMetadata} from "@/utils/metadata";

type Props = {
    params: Promise<{ id: string }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
    { params, searchParams }: Props
): Promise<Metadata> {
    const p = await searchParams
    const i = p?.i
    if(i){
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
    if(!i || typeof i != "string") return null // TO DO

    return <TopicPage
        topicId={i}
    />
}