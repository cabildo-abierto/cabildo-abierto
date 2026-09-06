"use client"

import {createContext, type ReactNode, useContext, useEffect, useState} from "react";
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
    const [user, setUserState] = useState<PublicUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        void get<SessionOutput>("/auth/session")
            .then(result => setUserState(result.success ? result.value.user : null))
            .catch(() => setUserState(null))
            .finally(() => setLoading(false));
    }, []);

    const logout = async () => {
        await post("/auth/logout");
        setUserState(null);
    };

    return <AuthContext.Provider value={{user, loading, setUser: setUserState, logout}}>
        {children}
    </AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used inside AuthProvider");
    return context;
}
