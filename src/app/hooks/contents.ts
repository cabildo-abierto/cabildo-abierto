import useSWR, { KeyedMutator } from "swr"
import { CommentProps, ContentProps, SmallContentProps, SmallEntityProps, UserStats } from "../lib/definitions"
import { fetcher } from "./utils"


export function useContent(id: string): {content: ContentProps | undefined, isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/content/'+id, fetcher)
    
    if(data && data.error){
        return {content: undefined,
            isLoading: false,
            isError: true
        }
    }
    return {
        content: data ? data.content : undefined,
        isLoading,
        isError: error
    }
}


export function useUserStats(): {stats: UserStats, isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/user-stats', fetcher)
  
    return {
        stats: data,
        isLoading,
        isError: error
    }
}


export function useSearchableContents(): {feed: SmallContentProps[], isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/searchable-contents', fetcher)
  
    return {
        feed: data,
        isLoading,
        isError: error
    }
}


export function useRouteFeed(route: string[]): {feed: SmallContentProps[], isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/feed/'+route.join("/"), fetcher)
  
    return {
        feed: data,
        isLoading,
        isError: error
    }
}


export function useRouteFollowingFeed(route: string[]): {feed: SmallContentProps[], isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/following-feed/'+route.join("/"), fetcher)
  
    return {
        feed: data,
        isLoading,
        isError: error
    }
}


export function useRouteEntities(route: string[]): {entities: SmallEntityProps[], isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/entities/'+route.join("/"), fetcher)
  
    return {
        entities: data,
        isLoading,
        isError: error
    }
}


export function useProfileFeed(id: string): {feed: SmallContentProps[], isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/profile-feed/'+id, fetcher)
  
    return {
        feed: data,
        isLoading,
        isError: error
    }
}


export function useEditsFeed(id: string): {feed: SmallContentProps[], isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/edits-feed/'+id, fetcher)
  
    return {
        feed: data,
        isLoading,
        isError: error
    }
}


export function useRepliesFeed(id: string): {feed: SmallContentProps[], isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/replies-feed/'+id, fetcher)

    return {
        feed: data,
        isLoading,
        isError: error
    }
}


export function useDrafts(): {drafts: {id: string}[], isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/drafts', fetcher)
  
    return {
        drafts: data,
        isLoading,
        isError: error
    }
}