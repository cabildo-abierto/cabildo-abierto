import useSWR from "swr"
import {
    DatasetProps,
    FeedContentProps, TopicProps, TopicVersionProps,
    TrendingTopicProps,
    UserStats,
    VisualizationProps
} from "../app/lib/definitions"
import { fetcher } from "./utils"
import {getDidFromUri, getRkeyFromUri} from "../components/utils";


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


export function useTopic(id: string): {topic: TopicProps, error?: string, isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/topic/'+id, fetcher)

    return {
        topic: data,
        isLoading,
        isError: error
    }
}


export function useTopicVersion(id: string): {topic: TopicVersionProps, error?: string, isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/topic-version/'+getDidFromUri(id)+"/"+getRkeyFromUri(id), fetcher)

    return {
        topic: data,
        isLoading,
        isError: error
    }
}


export function useTopicFeed(id: string): {feed: FeedContentProps[], error?: string, isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/topic-feed/'+encodeURIComponent(id), fetcher)

    return {
        feed: data,
        isLoading,
        isError: error
    }
}


export function useDatasets(): {datasets: DatasetProps[], isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/datasets', fetcher)

    return {
        datasets: data,
        isLoading,
        isError: error
    }
}


export function useVisualizations(): {visualizations: VisualizationProps[], isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/visualizations', fetcher)

    return {
        visualizations: data,
        isLoading,
        isError: error
    }
}


export function useDataset(uri: string): {dataset: {dataset: DatasetProps, data: any[]}, isLoading: boolean, error?: string}{
    const { data, error, isLoading } = useSWR('/api/dataset/'+getDidFromUri(uri)+"/"+getRkeyFromUri(uri), fetcher)

    if(data && data.error){
        return {error: data.error, isLoading: false, dataset: undefined}
    }
    return {
        dataset: data,
        isLoading
    }
}


export function useVisualization(uri: string): {visualization: VisualizationProps, isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/visualization/'+getDidFromUri(uri)+"/"+getRkeyFromUri(uri), fetcher)

    return {
        visualization: data,
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


export function useProfileFeed(id: string, kind: string): {feed: FeedContentProps[], isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/profile-feed/'+id+"/"+kind, fetcher)
  
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