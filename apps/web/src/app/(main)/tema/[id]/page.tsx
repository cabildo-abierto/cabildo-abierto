import { TopicPage } from "@/components/tema/topic-page"
import {Metadata} from "next";
import {createMetadata, mainMetadata} from "@/utils/metadata";
import {get} from "@/components/utils/react/fetch";

type Props = {
    params: Promise<{ id: string }>
}

export async function generateMetadata(
    { params }: Props
): Promise<Metadata> {
    const { id } = await params
    const topicTitle = await get<{title: string}>(`/topic-title/${id}`)
    if(topicTitle.success === true){
        return createMetadata({
            title: topicTitle.value.title,
            description: "Tema de discusión en Cabildo Abierto."
        })
    } else if(id){
        return createMetadata({
            title: id,
            description: "Tema de discusión en Cabildo Abierto."
        })
    } else {
        return mainMetadata
    }
}

export default async function Page() {
    return <TopicPage/>
}