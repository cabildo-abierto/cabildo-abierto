import useSWR from "swr"
import { SmallContentProps } from "../api/feed/route"
import { ContentProps } from "../lib/definitions"
import { getContentById } from "../../actions/actions"
import { fetcher } from "./utils"


export function useContent(id: string): {content: ContentProps | undefined, isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/content/'+id,
        async () => {return await getContentById(id)})
  
    return {
        content: data,
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


export function useViews(id: string): {views: number, isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/views/'+id, fetcher)
  
    return {
        views: data,
        isLoading,
        isError: error
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


export function useFeed(): {feed: SmallContentProps[], isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/feed', fetcher)
  
    return {
        feed: data,
        isLoading,
        isError: error
    }
}


export function useFollowingFeed(id: string): {feed: SmallContentProps[], isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/following-feed/'+id, fetcher)
  
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