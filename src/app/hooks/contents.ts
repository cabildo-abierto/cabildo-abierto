import useSWR, { KeyedMutator } from "swr"
import { SmallContentProps } from "../api/feed/route"
import { ContentProps, UserStats } from "../lib/definitions"
import { fetcher } from "./utils"


export function useContent(id: string): {content: ContentProps | undefined, isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/content/'+id, fetcher)
  
    return {
        content: data,
        isLoading,
        isError: error
    }
}


export function useRootContent(id: string): {content: ContentProps | undefined, isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/root/'+id, fetcher)
  
    return {
        content: data,
        isLoading,
        isError: error
    }
}


export function useChildrenCount(id: string): {count: number, isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/children-count/'+id, fetcher)
  
    return {
        count: data,
        isLoading,
        isError: error
    }
}


export function useEntityCategories(id: string): {categories: string, isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/entity-categories/'+id, fetcher)
  
    return {
        categories: data,
        isLoading,
        isError: error
    }
}


export function useContentComments(id: string): {comments: SmallContentProps[], isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/comments/'+id, fetcher)
  
    return {
        comments: data,
        isLoading,
        isError: error
    }
}


export function useEntityComments(id: string): {comments: SmallContentProps[], isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/entity-comments/'+id, fetcher)
  
    return {
        comments: data,
        isLoading,
        isError: error
    }
}


export function useViews(id: string): {views: number, isLoading: boolean, isError: boolean, mutate: KeyedMutator<any>}{
    const { data, error, isLoading, mutate } = useSWR('/api/views/'+id, fetcher)
  
    return {
        views: data,
        isLoading,
        isError: error,
        mutate: mutate
    }
}


export function useFakeNewsCount(id: string): {fakeNewsCount: number, isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/fake-news/'+id, fetcher)
  
    return {
        fakeNewsCount: data,
        isLoading,
        isError: error
    }
}


export function useReactions(id: string): {reactions: number, isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/reactions/'+id, fetcher)
  
    return {
        reactions: data,
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


export function useFeed(): {feed: SmallContentProps[], isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/feed', fetcher)
  
    return {
        feed: data,
        isLoading,
        isError: error
    }
}


export function useFollowingFeed(): {feed: SmallContentProps[], isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/following-feed', fetcher)
  
    return {
        feed: data,
        isLoading,
        isError: error
    }
}


export function useProfileFeed(id: string): {feed: {id: string}[], isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/profile-feed/'+id, fetcher)
  
    return {
        feed: data,
        isLoading,
        isError: error
    }
}


export function useEditsFeed(id: string): {feed: {id: string}[], isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/edits-feed/'+id, fetcher)
  
    return {
        feed: data,
        isLoading,
        isError: error
    }
}


export function useRepliesFeed(id: string): {feed: {id: string}[], isLoading: boolean, isError: boolean}{
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