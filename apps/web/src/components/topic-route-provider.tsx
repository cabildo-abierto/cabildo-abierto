"use client";

import {createContext, useContext, useEffect, type ReactNode} from "react";
import {useParams, usePathname} from "next/navigation";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import type {TopicOutput, TopicSummary} from "@cabildo-abierto/api";
import {get} from "@/utils/react/fetch";
import {TopicLoading} from "@/components/topic-loading";

const TopicRouteContext = createContext<TopicSummary | null>(null);

export function useTopicRoute() {
    const topic = useContext(TopicRouteContext);
    if (!topic) throw new Error("Missing topic route provider");
    return topic;
}

export function TopicRouteProvider({children}: {children: ReactNode}) {
    const {id: slug} = useParams<{id: string}>();
    const pathname = usePathname();
    const queryClient = useQueryClient();
    const resolution = useQuery({
        queryKey: ["topic-route", slug],
        queryFn: async () => {
            const result = await get<TopicOutput>(`/topics/resolve/${encodeURIComponent(slug)}`);
            if ("error" in result) throw new Error(result.error);
            return result.value.topic;
        },
    });
    const topicQuery = useQuery({
        queryKey: ["topic", resolution.data?.id],
        enabled: Boolean(resolution.data),
        queryFn: async () => {
            const result = await get<TopicOutput>(`/topics/${encodeURIComponent(resolution.data!.id)}`);
            if ("error" in result) throw new Error(result.error);
            return result.value.topic;
        },
    });
    const topic = topicQuery.data;
    useEffect(() => {
        if (!topic || topic.slug === slug) return;
        queryClient.setQueryData(["topic-route", topic.slug], topic);
        const parts = pathname.split("/");
        parts[2] = encodeURIComponent(topic.slug);
        // Replacing browser history preserves the mounted editor and its draft.
        window.history.replaceState(null, "", parts.join("/") + window.location.search + window.location.hash);
    }, [topic, slug, pathname, queryClient]);
    const error = resolution.error ?? topicQuery.error;
    if (error) return <p className="mx-auto max-w-2xl p-6 text-sm text-destructive">{error.message}</p>;
    if (!topic) return <TopicLoading/>;
    return <TopicRouteContext.Provider value={topic}>{children}</TopicRouteContext.Provider>;
}
