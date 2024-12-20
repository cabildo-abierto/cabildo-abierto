import useSWR from "swr"
import {FeedContentProps, TrendingTopicProps, UserStats} from "../app/lib/definitions"
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


export function useFeed(route: string[], feed: string): {feed: FeedContentProps[], isLoading: boolean, isError: boolean}{

    const { data, error, isLoading } = useSWR('/api/feed/'+[...route, feed].join("/"), fetcher)
    
    return {
        feed: data,
        isLoading,
        isError: error
    }
}


export function useTopics(route: string[]): {topics: any[], isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/topics/'+route.join("/"), fetcher)
  
    return {
        topics: data,
        isLoading,
        isError: error
    }
}


export function useTrendingTopics(route: string[], kind: string): {topics: TrendingTopicProps[], isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/trending-topics/'+route.join("/")+"?since="+kind, fetcher)

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