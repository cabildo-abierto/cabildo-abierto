"use client";

import type {ReactNode} from "react";
import {useAuth} from "@/components/auth-provider";
import {Spinner} from "@/components/ui/spinner";

export function AppSessionGate({children}: {children: ReactNode}) {
    const {loading} = useAuth();

    if (loading) return <div className="flex min-h-screen items-center justify-center gap-2 text-sm text-muted-foreground" aria-live="polite">
        <Spinner className={"size-8"}/>
    </div>;
    return <>{children}</>;
}
