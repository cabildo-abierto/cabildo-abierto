
import { fetcher } from "@/app/hooks/utils"
import useSWR from "swr"
import { SmallContentProps } from "../api/feed/route"
import { ContentProps } from "../lib/definitions"


export function useContent(id: string): {content: ContentProps, isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/content/'+id, fetcher)
  
    return {
        content: data,
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


export function useFollowingFeed(id: string | undefined): {feed: SmallContentProps[], isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR(id ? '/api/following-feed/'+id : "/api/feed", fetcher)
  
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


export function useDrafts(id: string): {drafts: {id: string}[], isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/drafts/'+id, fetcher)
  
    return {
        drafts: data,
        isLoading,
        isError: error
    }
}