import useSWR from "swr"
import { fetcher } from "./utils"


export function useSubscriptionPoolSize(): {poolSize: number, isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/pool-size', fetcher)
    return {
        poolSize: data,
        isLoading,
        isError: error
    }
}


export function useSubscriptionPrice(): {price: {price: number, remaining: number}, isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/subscription-price', fetcher)
    return {
        price: data,
        isLoading,
        isError: error
    }
}