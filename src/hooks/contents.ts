import useSWR from "swr"
import { FeedContentProps, SmallTopicProps, UserStats } from "../app/lib/definitions"
import { fetcher } from "./utils"


export function useUserStats(): {stats: UserStats, isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/user-stats', fetcher)
  
    return {
        stats: data,
        isLoading,
        isError: error
    }
}


export function useSearchableContents(): {feed: FeedContentProps[], isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/searchable-contents', fetcher)
  
    return {
        feed: data,
        isLoading,
        isError: error
    }
}


export function useRouteFeed(route: string[]): {feed: FeedContentProps[], isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/feed/'+route.join("/"), fetcher)
  
    return {
        feed: data,
        isLoading,
        isError: error
    }
}


export function useRouteFollowingFeed(route: string[]): {feed: FeedContentProps[], isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/following-feed/'+route.join("/"), fetcher)
    
    return {
        feed: data,
        isLoading,
        isError: error
    }
}


export function useRouteTopics(route: string[]): {topics: SmallTopicProps[], isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/topics/'+route.join("/"), fetcher)
  
    return {
        topics: data,
        isLoading,
        isError: error
    }
}


export function useProfileFeed(id: string): {feed: FeedContentProps[], isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/profile-feed/'+id, fetcher)
  
    return {
        feed: data,
        isLoading,
        isError: error
    }
}


export function useEditsFeed(id: string): {feed: FeedContentProps[], isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/edits-feed/'+id, fetcher)
  
    return {
        feed: data,
        isLoading,
        isError: error
    }
}


export function useRepliesFeed(id: string): {feed: FeedContentProps[], isLoading: boolean, isError: boolean}{
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