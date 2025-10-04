import {Query, useQuery} from "@tanstack/react-query";
import {get} from "@/utils/fetch";


export type RefetchInterval<T = any> = number | undefined | false | ((q: Query<T>) => number | undefined | false)


export function useAPI<T>(
    route: string,
    key: readonly unknown[],
    staleTime: number = Infinity,
    enabled: boolean = true,
    refetchInterval: RefetchInterval<T> = false
) {
    return useQuery<T>({
        queryKey: key,
        queryFn: async () => {
            const {data, error} = await get<T>(route)
            if (data) return data
            if (error) return null
            return data
        },
        staleTime,
        enabled,
        refetchInterval
    })
}

export function categoriesSearchParam(categories: string[]) {
    return categories.map(cat => `c=${encodeURIComponent(cat)}`).join("&");
}