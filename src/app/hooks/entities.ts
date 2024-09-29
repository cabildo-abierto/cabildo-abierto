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