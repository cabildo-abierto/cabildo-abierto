import { fetcher } from "src/app/hooks/utils"
import useSWR from "swr"
import { ContributionsArray, EntityProps, SmallEntityProps } from "../lib/definitions"


export function useEntity(id: string): {entity: EntityProps, isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/entity/'+id, fetcher)
    return {
        entity: data,
        isLoading,
        isError: error
    }
}


export function useContributions(id: string): {contributions: ContributionsArray, isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/contributions/'+id, fetcher)
    return {
        contributions: data,
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


export function useEntityViews(id: string): {views: number[], isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/entity-views/'+id, fetcher)
    return {
        views: data,
        isLoading,
        isError: error
    }
}


export function useEntityTextLength(id: string): {length: number, isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/entity-textlength/'+id, fetcher)
    return {
        length: data,
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