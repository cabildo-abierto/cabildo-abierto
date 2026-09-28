"use client"

import {createContext, useCallback, useContext, useMemo, useState, type ReactNode} from "react";
import {CheckIcon} from "@phosphor-icons/react";
import {cn} from "@/lib/utils";

type ToastOptions = {
    title: string
    description?: string
    variant?: "default" | "destructive"
};

type ToastContextValue = {toast: (options: ToastOptions) => void};
const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({children}: {children: ReactNode}) {
    const [toasts, setToasts] = useState<Array<ToastOptions & {id: number}>>([]);
    const toast = useCallback((options: ToastOptions) => {
        const id = Date.now() + Math.random();
        setToasts(current => [...current, {...options, id}]);
        window.setTimeout(() => setToasts(current => current.filter(item => item.id !== id)), 5000);
    }, []);
    const value = useMemo(() => ({toast}), [toast]);
    return <ToastContext.Provider value={value}>
        {children}
        <div className="pointer-events-none fixed right-4 bottom-4 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2">
            {toasts.map(item => <div key={item.id} role="status" className={cn(
                "pointer-events-auto flex items-center gap-3 rounded-lg border bg-background px-4 py-3 text-sm shadow-lg",
                item.variant === "destructive" && "border-destructive/50 text-destructive",
            )}>
                <CheckIcon className={cn("size-5 shrink-0 text-primary", item.variant === "destructive" && "text-destructive")} aria-hidden="true"/>
                <div>
                    <p className="font-medium">{item.title}</p>
                    {item.description && <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>}
                </div>
            </div>)}
        </div>
    </ToastContext.Provider>;
}

export function useToast(): ToastContextValue {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast must be used inside ToastProvider");
    return context;
}
