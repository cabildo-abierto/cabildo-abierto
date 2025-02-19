import useSWR from "swr"
import {
    DatasetProps,
    FeedContentProps, ThreadProps, TopicProps, TopicVersionProps,
    SmallTopicProps,
    UserStats,
    VisualizationProps, EngagementProps
} from "../app/lib/definitions"
import { fetcher } from "./utils"
import {getDidFromUri, getRkeyFromUri} from "../components/utils";


export function useUserStats(): {stats: UserStats, isLoading: boolean, isError: boolean}{
    return {stats: {} as UserStats, isLoading: false, isError: true}
    /*const { data, error, isLoading } = useSWR('/api/user-stats', fetcher)
  
    return {
        stats: data,
        isLoading,
        isError: error
    }*/
}


export function useSearchableContents(): {feed: FeedContentProps[], isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/searchable-contents', fetcher,
        {
            revalidateIfStale: false,
            revalidateOnFocus: false,
            revalidateOnReconnect: false
        }
    )
  
    return {
        feed: data,
        isLoading,
        isError: error
    }
}


export function useFeed(route: string[], feed: string): {feed: FeedContentProps[], isLoading: boolean, error: string}{

    const { data, isLoading } = useSWR('/api/feed/'+[...route, feed].join("/"), fetcher,
        {
            revalidateIfStale: false,
            revalidateOnFocus: false,
            revalidateOnReconnect: false
        }
    )

    if(data && data.error){
        return {feed: undefined, isLoading: false, error: data.error}
    }

    return {
        feed: data && data.feed ? data.feed : undefined,
        isLoading,
        error: data && data.error ? data.error : undefined
    }
}

export function useTopics(categories: string[], sortedBy: string): {topics: any[], isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/topics/alltime/'+sortedBy+'/'+categories.join("/"), fetcher)

    return {
        topics: data,
        isLoading,
        isError: error
    }
}


export function useCategories(): {categories: string[], isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/categories', fetcher,
        {
            revalidateIfStale: false,
            revalidateOnFocus: false,
            revalidateOnReconnect: false
        }
    )

    return {
        categories: data,
        isLoading,
        isError: error
    }
}


export function useTopic(id: string): {topic: TopicProps, error?: string, isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/topic/'+id, fetcher,
        {
            revalidateIfStale: false,
            revalidateOnFocus: false,
            revalidateOnReconnect: false
        }
    )

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


export function useTopicFeed(id: string): {feed: FeedContentProps[], error: string, isLoading: boolean}{
    const { data, error, isLoading } = useSWR('/api/topic-feed/'+encodeURIComponent(id), fetcher, {
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false
    })

    if(data && data.error){
        return {feed: undefined, isLoading: false, error: data.error}
    }

    return {
        feed: data && data.feed ? data.feed : undefined,
        isLoading,
        error: data && data.error ? data.error : undefined
    }
}


export function useDatasets(): {datasets: DatasetProps[], isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/datasets', fetcher,
        {
            revalidateIfStale: false,
            revalidateOnFocus: false,
            revalidateOnReconnect: false
        }
    )

    return {
        datasets: data,
        isLoading,
        isError: error
    }
}


export function useVisualizations(): {visualizations: VisualizationProps[], isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/visualizations', fetcher,
        {
            revalidateIfStale: false,
            revalidateOnFocus: false,
            revalidateOnReconnect: false
        }
    )

    return {
        visualizations: data,
        isLoading,
        isError: error
    }
}


export function useThread({did, viewerDid, rkey}: {did: string, viewerDid: string, rkey: string}): {thread: ThreadProps, isLoading: boolean, error?: string}{
    const { data, error, isLoading } = useSWR('/api/thread/'+did+"/"+rkey+"/"+viewerDid, fetcher,
        {
            revalidateIfStale: false,
            revalidateOnFocus: false,
            revalidateOnReconnect: false
        }
    )

    return {
        thread: data && data.thread ? data.thread : undefined,
        isLoading,
        error: data && data.error ? data.error : undefined
    }
}


export function useDataset(uri: string): {dataset: {dataset: DatasetProps, data: any[]}, isLoading: boolean, error?: string}{
    const { data, error, isLoading } = useSWR('/api/dataset/'+getDidFromUri(uri)+"/"+getRkeyFromUri(uri), fetcher,
        {
            revalidateIfStale: false,
            revalidateOnFocus: false,
            revalidateOnReconnect: false
        }
    )

    if(data && data.error){
        return {error: data.error, isLoading: false, dataset: undefined}
    }
    return {
        dataset: data,
        isLoading
    }
}


export function useVisualization(uri: string): {visualization: VisualizationProps & EngagementProps, isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/visualization/'+getDidFromUri(uri)+"/"+getRkeyFromUri(uri), fetcher,
        {
            revalidateIfStale: false,
            revalidateOnFocus: false,
            revalidateOnReconnect: false
        }
    )

    return {
        visualization: data,
        isLoading,
        isError: error
    }
}


export function useTrendingTopics(route: string[], kind: string): {topics: SmallTopicProps[], isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR(
        '/api/trending-topics/'+route.join("/")+"?since="+kind,
        fetcher,
        {
            revalidateIfStale: false,
            revalidateOnFocus: false,
            revalidateOnReconnect: false
        }
    )

    return {
        topics: data,
        isLoading,
        isError: error
    }
}


export function useProfileFeed(id: string, kind: string): {feed: FeedContentProps[], isLoading: boolean, error: string}{
    const { data, error, isLoading } = useSWR('/api/profile-feed/'+id+"/"+kind, fetcher)

    if(data && data.error){
        return {feed: undefined, isLoading: false, error: data.error}
    }

    return {
        feed: data && data.feed ? data.feed : undefined,
        isLoading,
        error: data && data.error ? data.error : undefined
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