"use client"

import {createContext, type ReactNode, useContext} from "react";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import type {PublicUser, SessionOutput} from "@cabildo-abierto/api";
import {get, post} from "@/utils/react/fetch";

type AuthContextValue = {
    user: PublicUser | null
    loading: boolean
    setUser: (user: PublicUser) => void
    logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({children}: {children: ReactNode}) {
    const queryClient = useQueryClient();
    const session = useQuery({
        queryKey: ["auth", "session"],
        queryFn: async () => {
            const result = await get<SessionOutput>("/auth/session");
            if ("error" in result) throw new Error(result.error);
            return result.value.user;
        },
        retry: false,
    });
    const logoutMutation = useMutation({
        mutationFn: () => post("/auth/logout"),
        onSuccess: () => { queryClient.setQueryData(["auth", "session"], null); },
    });
    const setUser = (user: PublicUser) => queryClient.setQueryData(["auth", "session"], user);
    const logout = async () => { await logoutMutation.mutateAsync(); };

    return <AuthContext.Provider value={{user: session.data ?? null, loading: session.isLoading, setUser, logout}}>
        {children}
    </AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used inside AuthProvider");
    return context;
}
