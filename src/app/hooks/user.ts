import { fetcher } from "@/app/hooks/utils"
import useSWR from "swr"
import { UserProps } from "../lib/definitions"


export function useUser(): {user: UserProps, isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/user', fetcher)
  
    return {
        user: data ? data : undefined,
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