import useSWR from "swr"
import { fetcher } from "./utils"
import {TopicProps} from "../app/lib/definitions";


export function useTopic(id: string): {topic: TopicProps, error?: string, isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/topic/'+id, fetcher)

    return {
        topic: data,
        isLoading,
        isError: error
    }
}