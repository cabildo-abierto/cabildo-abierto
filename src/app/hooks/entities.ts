import { fetcher } from "src/app/hooks/utils"
import useSWR from "swr"
import { EntityProps, SmallEntityProps } from "../lib/definitions"


export function useEntity(id: string): {entity: EntityProps, isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/entity/'+id, fetcher)
    return {
        entity: data,
        isLoading,
        isError: error
    }
}


export function useEntities(): {entities: SmallEntityProps[], isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/entities', fetcher)
  
    return {
        entities: data,
        isLoading,
        isError: error
    }
}


export function useCategories(): {categories: string[], isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/categories', fetcher)
  
    return {
        categories: data,
        isLoading,
        isError: error
    }
}