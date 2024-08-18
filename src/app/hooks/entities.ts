import { fetcher } from "@/app/hooks/utils"
import useSWR from "swr"
import { EntityProps } from "../lib/definitions"


export function useEntity(id: string): {entity: EntityProps, isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/entity/'+id, fetcher)
  
    return {
        entity: data,
        isLoading,
        isError: error
    }
}


export function useEntities(): {entities: EntityProps[], isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/entities', fetcher)
  
    return {
        entities: data,
        isLoading,
        isError: error
    }
}