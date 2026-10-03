"use client";

import Link from "next/link";
import {BellIcon} from "@phosphor-icons/react";
import {useQuery} from "@tanstack/react-query";
import type {NotificationCountOutput} from "@cabildo-abierto/api";
import {useAuth} from "@/components/auth-provider";
import {Button} from "@/components/ui/button";
import {get} from "@/utils/react/fetch";
import {cn} from "@/lib/utils";

export function NotificationBell() {
    const {user} = useAuth();
    const count = useQuery({
        queryKey: ["notifications", "count", user?.id],
        enabled: !!user,
        queryFn: async () => {
            const result = await get<NotificationCountOutput>("/notifications/count");
            if ("error" in result) throw new Error(result.error);
            return result.value.unreadCount;
        },
        refetchInterval: 30_000,
        refetchOnWindowFocus: true,
    });
    if (!user) return null;
    const unread = count.data ?? 0;
    return <Button nativeButton={false} render={<Link href="/notificaciones"/>} variant="ghost" size="icon-sm"
        aria-label={unread ? `Notificaciones: ${unread} sin leer` : "Notificaciones"} title="Notificaciones"
        className={cn("relative")}>
        <BellIcon/>
        {unread > 0 && <span aria-hidden="true" className={cn("absolute -right-1 -top-1 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground")}>
            {unread > 99 ? "99+" : unread}
        </span>}
    </Button>;
}
