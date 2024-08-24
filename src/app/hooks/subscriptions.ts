import { fetcher } from "@/app/hooks/utils"
import useSWR from "swr"


export function useSubscriptionPoolSize(): {poolSize: number, isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/pool-size', fetcher)
    return {
        poolSize: data,
        isLoading,
        isError: error
    }
}