import useSWR from "swr"
import { NotificationProps, UserProps } from "../lib/definitions"
import { fetcher } from "./utils"
import { ChatMessage } from "@prisma/client"


export function useUser(): {user: UserProps | null, isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/user', fetcher)
    
    if(data && data.status == "not logged in"){
        return {
            user: undefined,
            isLoading: false,
            isError: false
        }
    }
    return {
        user: data,
        isLoading: isLoading,
        isError: error
    }
}


export function useUserFollowSuggestions(): {suggestions: {id: string, name: string}[] | null, isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/follow-suggestions', fetcher)
  
    return {
        suggestions: data,
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


export function useNotifications(): {notifications: NotificationProps[], isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/notifications', fetcher, { refreshInterval: 5*60*1000 })
  
    return {
        notifications: data,
        isLoading: isLoading,
        isError: error
    }
}