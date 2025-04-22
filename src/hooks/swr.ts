import useSWR from "swr"
import {
    DatasetProps,
    EngagementProps,
    FeedContentProps, Profile, Session,
    SmallTopicProps,
    SmallUserProps,
    TopicHistoryProps,
    TopicProps,
    TopicsGraph,
    TopicVersionAuthorsProps,
    UserProps,
    VisualizationProps
} from "@/lib/types"
import {fetcher, fetcherWithCredentials} from "./fetcher"
import {QuotedContent} from "@/components/feed/content-quote";
import {backendUrl, getDidFromUri, getRkeyFromUri, threadApiUrl} from "@/utils/uri";
import {SmallTopicVersionProps} from "@/components/topics/topic/topic-content-expanded-view";
import {ProfileViewDetailed} from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import {ChatMessage} from "@prisma/client";
import {FeedViewContent, ThreadViewContent} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {ProfileFeedOption} from "@/components/profile/profile-page";


export type SWRConfigProps = {
    revalidateIfStale?: boolean
    revalidateOnFocus?: boolean
    revalidateOnReconnect?: boolean
}


export function useAPI<T>(route: string, config: SWRConfigProps = {revalidateIfStale: false, revalidateOnFocus: false, revalidateOnReconnect: false}): {data: T, isLoading: boolean, error?: string} {
    const { data, isLoading } = useSWR(backendUrl + route, fetcherWithCredentials, config)

    return {
        data: data && data.data ? data.data : undefined,
        isLoading,
        error: data && data.error ? data.error : undefined
    }
}

export const useSession = (revalidate: boolean = false) => {
    const res = useAPI<Session>("/session", {
        revalidateOnFocus: revalidate,
        revalidateOnReconnect: revalidate,
        revalidateIfStale: revalidate
    })
    return {...res, user: res.data}
}

export const useThread = (uri: string) => {
    return useAPI<ThreadViewContent>(threadApiUrl(uri), {revalidateIfStale: true})
}


export const useTrendingTopics = () => {
    return useAPI<SmallTopicProps[]>("/trending-topics")
}


export type FeedKind = "discusion" | "siguiendo" | "descubrir"


export const useFeed = (feed: FeedKind) => {
    return useAPI<FeedViewContent[]>("/feed/" + feed)
}


export function useProfile(handleOrDid: string) {
    return useAPI<Profile>("/profile/" + handleOrDid)
}


export function useProfileFeed(handleOrDid: string, kind: ProfileFeedOption) {
    return useAPI<FeedViewContent[]>("/profile-feed/" + handleOrDid + "/" + kind)
}


export function useTopics(categories: string[], sortedBy: string): {topics: SmallTopicProps[], isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/topics/alltime/'+sortedBy+"/"+categories.join("/"), fetcher,
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


export function useCategories(): {categories: {category: string, size: number}[], isLoading: boolean, isError: boolean}{
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


export function useTopicHistory(id: string): {topicHistory: TopicHistoryProps, error?: string, isLoading: boolean}{
    const { data, isLoading } = useSWR('/api/topic-history/'+id, fetcher,
        {
            revalidateIfStale: true,
            revalidateOnFocus: false,
            revalidateOnReconnect: false
        }
    )

    return {
        topicHistory: data && data.topicHistory ? data.topicHistory : undefined,
        isLoading,
        error: data && data.error ? data.error : undefined
    }
}


export function useTopicVersion(did: string, rkey: string): {topicVersion: SmallTopicVersionProps, error?: string, isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/topic-version/'+did+"/"+rkey, fetcher,
        {
            revalidateIfStale: false,
            revalidateOnFocus: false,
            revalidateOnReconnect: false
        }
    )

    return {
        topicVersion: data,
        isLoading,
        isError: error
    }
}


export function useTopicVersionAuthors(did: string, rkey: string): {topicVersionAuthors: TopicVersionAuthorsProps, error?: string, isLoading: boolean, isError: boolean}{
    const { data, isLoading } = useSWR('/api/topic-version-authors/'+did+"/"+rkey, fetcher,
        {
            revalidateIfStale: false,
            revalidateOnFocus: false,
            revalidateOnReconnect: false
        }
    )

    return {
        topicVersionAuthors: data ? data.topicVersionAuthors : undefined,
        isLoading,
        isError: data ? data.error : undefined
    }
}


export function useTopicVersionChanges(did: string, rkey: string): {topicVersionChanges: TopicVersionAuthorsProps, error?: string, isLoading: boolean, isError: boolean}{
    const { data, isLoading } = useSWR('/api/topic-version-changes/'+did+"/"+rkey, fetcher,
        {
            revalidateIfStale: false,
            revalidateOnFocus: false,
            revalidateOnReconnect: false
        }
    )

    return {
        topicVersionChanges: data ? data.topicVersionChanges : undefined,
        isLoading,
        isError: data ? data.error : undefined
    }
}



export function useQuotedContent(uri: string): {quotedContent: QuotedContent, error?: string, isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/quoted-content/'+getDidFromUri(uri)+"/"+getRkeyFromUri(uri), fetcher,
        {
            revalidateIfStale: false,
            revalidateOnFocus: false,
            revalidateOnReconnect: false
        }
    )

    return {
        quotedContent: data,
        isLoading,
        isError: error
    }
}


export function useTopicFeed(id: string): {feed: {mentions: FeedContentProps[], replies: FeedContentProps[], topics: string[]}, error: string, isLoading: boolean}{
    const { data, isLoading } = useSWR('/api/topic-feed/'+encodeURIComponent(id), fetcher, {
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


export function useVisualizations(): {visualizations: VisualizationProps[], isLoading: boolean, error: string}{
    const { data, error, isLoading } = useSWR(backendUrl + '/visualizations', fetcherWithCredentials,
        {
            revalidateIfStale: false,
            revalidateOnFocus: false,
            revalidateOnReconnect: false
        }
    )

    return {
        visualizations: data && data.visualizations ? data.visualizations : undefined,
        isLoading,
        error: data && data.error ? data.error : undefined
    }
}





export function useDataset(uri: string): {dataset: {dataset: DatasetProps & EngagementProps, data: any[]}, isLoading: boolean, error?: string}{
    const { data, isLoading } = useSWR('/api/dataset/'+getDidFromUri(uri)+"/"+getRkeyFromUri(uri), fetcher,
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


export function useVisualization(uri: string): {visualization: VisualizationProps & EngagementProps, isLoading: boolean, error: string}{
    const { data, isLoading } = useSWR('/api/visualization/'+getDidFromUri(uri)+"/"+getRkeyFromUri(uri), fetcher,
        {
            revalidateIfStale: false,
            revalidateOnFocus: false,
            revalidateOnReconnect: false
        }
    )

    return {
        visualization: data && data.visualization ? data.visualization : undefined,
        isLoading,
        error: data && data.error ? data.error : undefined
    }
}


export function useTopicsByCategories(sortedBy: string): {byCategories: {c: string, topics: string[], size: number}[], isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR(
        '/api/topics-by-categories/'+sortedBy,
        fetcher,
        {
            revalidateIfStale: false,
            revalidateOnFocus: false,
            revalidateOnReconnect: false
        }
    )

    return {
        byCategories: data,
        isLoading,
        isError: error
    }
}


export function useCategoriesGraph(): {graph: TopicsGraph, isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR(
        '/api/categories-graph',
        fetcher,
        {
            revalidateIfStale: false,
            revalidateOnFocus: false,
            revalidateOnReconnect: false
        }
    )

    return {
        graph: data,
        isLoading,
        isError: error
    }
}


export function useCategoryGraph(c: string): {graph: TopicsGraph, isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR(
        '/api/category-graph/'+c,
        fetcher,
        {
            revalidateIfStale: false,
            revalidateOnFocus: false,
            revalidateOnReconnect: false
        }
    )

    return {
        graph: data,
        isLoading,
        isError: error
    }
}


export function useBskyUser(): { bskyUser: ProfileViewDetailed, isLoading?: boolean, error?: string } {
    const {data, error, isLoading} = useSWR('/api/user/bsky', fetcher, {
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false
    })

    return {
        bskyUser: data ? data?.bskyUser : undefined,
        isLoading,
        error
    }
}

export function useUsers(): { users: SmallUserProps[], isLoading: boolean, isError: boolean } {
    const {data, error, isLoading} = useSWR('/api/users', fetcher, {
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false
    })

    return {
        users: data,
        isLoading: isLoading,
        isError: error
    }
}

export function useCodes(): { codes: string[], isLoading: boolean, isError: boolean } {
    const {data, error, isLoading} = useSWR('/api/codes', fetcher, {
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false
    })

    return {
        codes: data,
        isLoading: isLoading,
        isError: error
    }
}

export function useChat(fromUserId: string, toUserId: string): {
    chat: ChatMessage[] | null,
    isLoading: boolean,
    isError: boolean
} {
    const {
        data,
        error,
        isLoading
    } = useSWR('/api/chat/' + fromUserId + '/' + toUserId, fetcher, {refreshInterval: 30 * 60 * 1000})

    return {
        chat: data,
        isLoading: isLoading,
        isError: error
    }
}

export function useSubscriptionPrice(): {
    price: { price: number, remaining: number },
    isLoading: boolean,
    isError: boolean
} {
    const {data, error, isLoading} = useSWR('/api/subscription-price', fetcher)
    return {
        price: data,
        isLoading,
        isError: error
    }
}

export function useFundingPercentage(): { fundingPercentage: number, isLoading: boolean, isError: boolean } {
    const {data, error, isLoading} = useSWR('/api/funding-percentage', fetcher)
    return {
        fundingPercentage: data,
        isLoading,
        isError: error
    }
}

export function useDonationsDistribution(): { donationsDistribution: number[], isLoading: boolean, isError: boolean } {
    const {data, error, isLoading} = useSWR('/api/donations-distribution', fetcher)
    return {
        donationsDistribution: data,
        isLoading,
        isError: error
    }
}