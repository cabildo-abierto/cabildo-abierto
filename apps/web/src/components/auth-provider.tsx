"use client"

import {createContext, type ReactNode, useContext} from "react";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import type {PublicUser, SessionOutput} from "@cabildo-abierto/api";
import {useRouter} from "next/navigation";
import {get, post} from "@/utils/react/fetch";

type AuthContextValue = {
    user: PublicUser | null
    loading: boolean
    setUser: (user: PublicUser) => Promise<void>
    logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({children}: {children: ReactNode}) {
    const queryClient = useQueryClient();
    const router = useRouter();
    const session = useQuery({
        queryKey: ["auth", "session"],
        queryFn: async () => {
            const result = await get<SessionOutput>("/auth/session");
            if ("error" in result) throw new Error(result.error);
            return result.value.user;
        },
        retry: false,
    });
    const updateSession = async (user: PublicUser | null) => {
        await queryClient.cancelQueries();
        // Keep the observed session query while discarding the previous account's data.
        queryClient.removeQueries({predicate: query => !(query.queryKey.length === 2
            && query.queryKey[0] === 'auth' && query.queryKey[1] === 'session')});
        queryClient.setQueryData(["auth", "session"], user);
    };
    const logoutMutation = useMutation({
        mutationFn: () => post("/auth/logout"),
        onSuccess: () => updateSession(null),
    });
    const setUser = (user: PublicUser) => updateSession(user);
    const logout = async () => {
        await logoutMutation.mutateAsync();
        router.replace("/");
    };

    return <AuthContext.Provider value={{user: session.data ?? null, loading: session.isLoading, setUser, logout}}>
        {children}
    </AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used inside AuthProvider");
    return context;
}
