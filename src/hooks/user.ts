import {SmallUserProps, UserProps} from "../app/lib/definitions"
import { fetcher } from "./utils"
import { ChatMessage } from "@prisma/client"
import useSWR from "swr"
import {ProfileViewDetailed} from "@atproto/api/dist/client/types/app/bsky/actor/defs";


export function useFullProfile(did: string): {user: UserProps, atprotoProfile: ProfileViewDetailed, isLoading?: boolean, error?: string} {
    const { data, error, isLoading } = useSWR('/api/user/'+did, fetcher, {
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false
    })

    return {
        user: data && data.user ? data.user : undefined,
        atprotoProfile: data && data.atprotoProfile ? data.atprotoProfile : undefined,
        isLoading,
        error
    }
}


export function useUser(revalidate: boolean = false): {user: UserProps, isLoading?: boolean, error?: string} {
    const { data, error, isLoading } = useSWR('/api/user', fetcher, {
        revalidateIfStale: revalidate,
        revalidateOnFocus: revalidate,
        revalidateOnReconnect: revalidate
    })

    return {
        user: data ? data?.user : undefined,
        isLoading,
        error
    }
}


export function useBskyUser(): {bskyUser: ProfileViewDetailed, isLoading?: boolean, error?: string} {
    const { data, error, isLoading } = useSWR('/api/user/bsky', fetcher, {
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


export function useUsers(): {users: SmallUserProps[], isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/users', fetcher, {
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


export function useCodes(): {codes: string[], isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/codes', fetcher, {
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


export function useChat(fromUserId: string, toUserId: string): {chat: ChatMessage[] | null, isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/chat/'+fromUserId+'/'+toUserId, fetcher, { refreshInterval: 30*60*1000 })
  
    return {
        chat: data,
        isLoading: isLoading,
        isError: error
    }
}


export function useSupportNotRespondedCount(): {count: number, isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/support-pending-count', fetcher, { refreshInterval: 5*60*1000 })
  
    return {
        count: data,
        isLoading: isLoading,
        isError: error
    }
}


export function useNotifications(): {notifications: any[], isLoading: boolean, isError: boolean}{
    //const { data, error, isLoading } = useSWR('/api/notifications', fetcher)

    return {
        notifications: [],
        isLoading: false,
        isError: false
    }
}