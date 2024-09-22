import useSWR from "swr"
import { UserProps } from "../lib/definitions"
import { fetcher } from "./utils"
import { ChatMessage } from "@prisma/client"


export function useUser(): {user: UserProps | null, isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/user', fetcher)
  
    return {
        user: data,
        isLoading: isLoading,
        isError: error
    }
}


export function useUserId(): {userId: string | null, isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/userid', fetcher)
  
    return {
        userId: data,
        isLoading: isLoading,
        isError: error
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


export function useUserLikesContent(contentId: string): {userLikesContent: boolean, isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/user-like-content/'+contentId, fetcher)
  
    return {
        userLikesContent: data,
        isLoading: isLoading,
        isError: error
    }
}



export function useUsers(): {users: UserProps[], isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/users', fetcher)
  
    return {
        users: data,
        isLoading: isLoading,
        isError: error
    }
}


export function useChat(fromUserId: string, toUserId: string): {chat: ChatMessage[] | null, isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/chat/'+fromUserId+'/'+toUserId, fetcher, { refreshInterval: 1000 })
  
    return {
        chat: data,
        isLoading: isLoading,
        isError: error
    }
}