"use client";

import {useOptionalTopicRoute} from '@/components/topic-route-provider';
import {queryOptions, useQuery} from "@tanstack/react-query";
import type {LccaAnalysis} from "@cabildo-abierto/api";
import {dataViewRequest} from "@/utils/react/data-view-request";

export function lccaAnalysisOptions(query: string, contextTopicId?: string) {
    return queryOptions({
        queryKey: ["lcca-analysis", query, 1, contextTopicId],
        queryFn: ({signal}) => dataViewRequest<LccaAnalysis>("/lcca/analyze", {
            method: "POST",
            signal,
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({query, queryLanguageVersion: 1, contextTopicId}),
        }),
        staleTime: Infinity,
        gcTime: 5 * 60 * 1000,
        retry: false,
    });
}

export function useLccaAnalysis(query: string) {
    const topic = useOptionalTopicRoute();
    return useQuery({...lccaAnalysisOptions(query, topic?.id), enabled: !!query.trim()});
}
