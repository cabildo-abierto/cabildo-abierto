import useSWR from "swr"
import { NotificationProps, UserProps } from "../lib/definitions"
import { fetcher } from "./utils"
import { ChatMessage } from "@prisma/client"
import { useCallback, useContext, useEffect, useState } from "react"
import { SessionContext } from "../../contexts/SessionContext"
import { BskyAgent } from "@atproto/api"
import { ProfileViewDetailed } from "@atproto/api/dist/client/types/app/bsky/actor/defs"
import { getUserById } from "../../actions/users"


export function useUser(): {user: UserProps | null, isLoading: boolean, error?: string}{
    const { data, error, isLoading } = useSWR('/api/user', fetcher)
    const bskyUser = useBskyUser()

    if(data && (data.status == "not logged in" || data.error)){
        return {
            user: bskyUser.user,
            isLoading: bskyUser.isLoading
        }
    }
    return {
        user: data ? data.user : undefined,
        isLoading: isLoading,
        error: undefined
    }
}


export function useBskyUser() {

    const manager = useContext(SessionContext)
    const [loading, setLoading] = useState(false)
    const [profile, setProfile] = useState<undefined | {profile: ProfileViewDetailed, user?: UserProps}>(undefined)

    const LoadProfiles = useCallback(async () => {
        setLoading(true)
        const ids = await manager.getIdentities()
        if (ids.length === 0) {
          setLoading(false)
          return
        }
        // get avatar
        const agent = new BskyAgent({
          service: 'https://public.api.bsky.app'
        })
        const profiles = (await agent.getProfiles({ actors: ids.map(id => id.handle) })).data.profiles

        console.log("profile found", profiles[0], profiles[0].did)

        const {user} = await getUserById(profiles[0].did)
        console.log("got user", user)

        setProfile({profile: profiles[0], user: user ? user : undefined})
    }, [setLoading, manager])

    useEffect(() => {
        if(loading && profile != undefined){
            setLoading(false)
        }
    }, [profile])

    useEffect(() => {
        void LoadProfiles()
    }, [manager, LoadProfiles])

    return {...profile, isLoading: loading}
}


export function useAuthUser(): {authUser: {name: string} | null, isLoading: boolean, error?: string}{
    const { data, error, isLoading } = useSWR('/api/auth-user', fetcher)

    return {
        authUser: data,
        isLoading: isLoading,
        error: error
    }
}



export function useUserFollowSuggestions(): {suggestions: {id: string, name: string}[] | null, isLoading: boolean, error: boolean}{
    const { data, error, isLoading } = useSWR('/api/follow-suggestions', fetcher)
    
    return {
        suggestions: data,
        isLoading: isLoading,
        error: error
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
    const { data, error, isLoading } = useSWR('/api/notifications', fetcher)
    
    return {
        notifications: data,
        isLoading: isLoading,
        isError: error
    }
}