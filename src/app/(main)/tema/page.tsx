"use client"
import { TopicPage } from "@/components/topics/topic/topic-page"
import {useSearchParams} from "next/navigation";


const Page = () => {
    const i = useSearchParams().get("i")

    return <TopicPage
        topicId={i}
    />
}

export default Page