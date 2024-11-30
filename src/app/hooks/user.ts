import useSWR from "swr"
import { NotificationProps, SmallUserProps, UserProps } from "../lib/definitions"
import { fetcher } from "./utils"
import { ChatMessage, ContentType } from "@prisma/client"
import { useCallback, useContext, useEffect, useState } from "react"
import { BskyAgent } from "@atproto/api"
import { ProfileViewDetailed } from "@atproto/api/dist/client/types/app/bsky/actor/defs"
import { getUserById } from "../../actions/users"



export function useUser(): {user: UserProps, isLoading?: boolean, error?: string} {
    const { data, error, isLoading } = useSWR('/api/user', fetcher)

    return {
        user: data,
        isLoading,
        error
    }
}


export function useUserContents(userId: string): {userContents: {id: string, type: ContentType, parentEntityId: string}[], isLoading: boolean, isError: boolean}{
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


export function useNotifications(): {notifications: NotificationProps[], isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/notifications', fetcher)
    
    return {
        notifications: data,
        isLoading: isLoading,
        isError: error
    }
}