import useSWR from "swr"
import { EntityProps } from "../lib/definitions"
import { fetcher } from "./utils"


export function useEntity(id: string): {entity: EntityProps, error?: string, isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/entity/'+id, fetcher)

    if(data && data.error) return {
        entity: null,
        error: data.error,
        isLoading,
        isError: error
    }

    return {
        entity: data,
        isLoading,
        isError: error
    }
}