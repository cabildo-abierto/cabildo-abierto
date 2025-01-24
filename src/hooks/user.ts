
import {ArticleProps, SmallUserProps, UserProps} from "../app/lib/definitions"
import { fetcher } from "./utils"
import { ChatMessage } from "@prisma/client"
import useSWR from "swr"
import {getDidFromUri, getRkeyFromUri} from "../components/utils";


export function useArticle(uri: string): {article: ArticleProps, isLoading?: boolean, error?: string} {
    const { data, error, isLoading } = useSWR('/api/article/'+getDidFromUri(uri)+"/"+getRkeyFromUri(uri), fetcher)

    return {
        article: data,
        isLoading,
        error
    }
}

export function useUser(): {user: UserProps, isLoading?: boolean, error?: string} {
    const { data, error, isLoading } = useSWR('/api/user', fetcher)

    return {
        user: data ? data?.user : undefined,
        isLoading,
        error
    }
}


export function useUserContents(userId: string): {userContents: {id: string, type: string, parentEntityId: string}[], isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/userContents/'+userId, fetcher)
  
    return {
        userContents: data ? data : undefined,
        isLoading: isLoading,
        isError: error
    }
}


export function useUsers(): {users: SmallUserProps[], isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/users', fetcher)
  
    return {
        users: data,
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