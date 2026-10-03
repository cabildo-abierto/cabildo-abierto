"use client";

import {useRouter} from "next/navigation";
import Link from "next/link";
import {useInfiniteQuery, useQueryClient} from "@tanstack/react-query";
import type {Notification, NotificationsOutput} from "@cabildo-abierto/api";
import {Button} from "@/components/ui/button";
import {Spinner} from "@/components/ui/spinner";
import {formatRelativeDate} from "@/components/topic-block-date";
import {get, patch} from "@/utils/react/fetch";
import {cn} from "@/lib/utils";
import {useAuth} from "@/components/auth-provider";
import {NotificationIcon} from "@/components/notification-icon";
import {useEffect, useRef} from "react";

function notificationHref(item: Notification): string {
    if (item.targetDeleted) return `/tema/${encodeURIComponent(item.topic.slug)}`;
    if (item.documentBlockId) return `/documento/${encodeURIComponent(item.targetId)}?comentario=${encodeURIComponent(item.sourceId)}#bloque-${encodeURIComponent(item.documentBlockId)}`;
    const topic = `/tema/${encodeURIComponent(item.topic.slug)}`;
    if (!item.blockNumber) return `${topic}/titulo${item.kind === "comment" || item.kind === "reply" || item.kind === "replica" || item.kind === "rejection" ? `?comentario=${encodeURIComponent(item.sourceId)}` : ""}#propuesta-${encodeURIComponent(item.targetId)}`;
    const block = `${topic}/bloque/${encodeURIComponent(item.blockNumber)}`;
    if (item.kind === "comment" || item.kind === "reply" || item.kind === "replica" || item.kind === "rejection") return `${block}?seccion=comentarios&comentario=${encodeURIComponent(item.sourceId)}`;
    return `${block}?seccion=historial&edicion=${encodeURIComponent(item.targetId)}`;
}

function notificationText(item: Notification): string {
    switch (item.kind) {
        case "replica": return item.replicaToReplica
            ? `${item.actor.username} replicó a tu réplica`
            : `${item.actor.username} replicó tu voto`;
        case "reply": return `${item.actor.username} respondió a tu comentario`;
        case "rejection": return `${item.actor.username} rechazó ${item.blockNumber ? "tu edición" : "tu propuesta de título"}`;
        case "positive_vote": return `${item.actor.username} votó a favor de tu edición`;
        case "edit": return `${item.actor.username} editó un bloque que editaste`;
        case "comment": return `${item.actor.username} comentó ${item.documentBlockId ? "tu documento" : item.blockNumber ? "tu edición" : "tu propuesta de título"}`;
    }
}

export function NotificationList() {
    const {user} = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();
    const markedForUser = useRef<string | null>(null);
    useEffect(() => {
        if (!user || markedForUser.current === user.id) return;
        markedForUser.current = user.id;
        void (async () => {
            const result = await patch("/notifications/read-all", {});
            if (!("error" in result)) await queryClient.invalidateQueries({queryKey: ["notifications"]});
        })();
    }, [user, queryClient]);
    const query = useInfiniteQuery({
        queryKey: ["notifications", "list", user?.id],
        enabled: !!user,
        initialPageParam: null as string | null,
        queryFn: async ({pageParam}) => {
            const result = await get<NotificationsOutput>(`/notifications${pageParam ? `?cursor=${encodeURIComponent(pageParam)}` : ""}`);
            if ("error" in result) throw new Error(result.error);
            return result.value;
        },
        getNextPageParam: page => page.nextCursor,
        refetchInterval: 30_000,
        refetchOnWindowFocus: true,
    });
    const notifications = query.data?.pages.flatMap(page => page.notifications) ?? [];
    const open = async (item: Notification) => {
        if (!item.readAt) {
            const result = await patch(`/notifications/${encodeURIComponent(item.id)}/read`, {});
            if (!("error" in result)) {
                void queryClient.invalidateQueries({queryKey: ["notifications"]});
            }
        }
        router.push(notificationHref(item));
    };
    if (!user) return <section className={cn("mx-auto max-w-[682px] p-6 text-sm")}>
        <Link href="/iniciar-sesion" className={cn("text-foreground underline underline-offset-4")}>Iniciá sesión</Link> para ver tus notificaciones.
    </section>;
    return <section className={cn("mx-auto max-w-[682px] space-y-5 p-6")}>
        <h1 className={cn("text-xl font-semibold")}>Notificaciones</h1>
        {query.isPending && <p className={cn("flex items-center gap-2 text-sm text-muted-foreground")}><Spinner/>Cargando notificaciones…</p>}
        {query.error && <p role="alert" className={cn("text-sm text-destructive")}>{query.error.message}</p>}
        {!query.isPending && !query.error && notifications.length === 0 && <p className={cn("text-sm text-muted-foreground")}>Todavía no tenés notificaciones.</p>}
        <ol className={cn("space-y-2")}>
            {notifications.map(item => <li key={item.id}>
                <Button variant="ghost" className={cn("h-auto w-full items-start justify-start gap-2.5 whitespace-normal rounded-lg border border-border p-3.5 text-left hover:bg-muted/50", !item.readAt && "border-primary/30 bg-primary/5")}
                    onClick={() => void open(item)}>
                    <NotificationIcon kind={item.kind}/>
                    <span className={cn("flex min-w-0 flex-1 flex-col gap-1")}>
                        <span className={cn("text-sm font-medium leading-snug")}>{notificationText(item)}</span>
                        <span className={cn("text-xs text-muted-foreground")}>{item.topic.title}{item.blockNumber ? ` · ${item.blockNumber}` : ""} · {formatRelativeDate(item.createdAt)}</span>
                    </span>
                    {!item.readAt && <span aria-label="Sin leer" className={cn("mt-1.5 size-2 shrink-0 rounded-full bg-primary")}/>}
                </Button>
            </li>)}
        </ol>
        {query.hasNextPage && <Button variant="outline" disabled={query.isFetchingNextPage} onClick={() => void query.fetchNextPage()}>
            {query.isFetchingNextPage ? "Cargando…" : "Ver más"}
        </Button>}
    </section>;
}
