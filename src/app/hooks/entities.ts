import useSWR from "swr"
import { EntityProps } from "../lib/definitions"
import { fetcher } from "./utils"


export function useEntity(id: string): {entity: EntityProps, isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/entity/'+id, fetcher)
    return {
        entity: data,
        isLoading,
        isError: error
    }
}


export function useEntityReactions(id: string): {reactions: number[], isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/entity-reactions/'+id, fetcher)
    return {
        reactions: data,
        isLoading,
        isError: error
    }
}