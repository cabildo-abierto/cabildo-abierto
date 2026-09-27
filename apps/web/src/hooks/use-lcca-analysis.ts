"use client";

import {queryOptions, useQuery} from "@tanstack/react-query";
import type {LccaAnalysis} from "@cabildo-abierto/api";
import {dataViewRequest} from "@/utils/react/data-view-request";

export function lccaAnalysisOptions(query: string) {
    return queryOptions({
        queryKey: ["lcca-analysis", query, 1],
        queryFn: ({signal}) => dataViewRequest<LccaAnalysis>("/lcca/analyze", {
            method: "POST",
            signal,
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({query, queryLanguageVersion: 1}),
        }),
        staleTime: Infinity,
        gcTime: 5 * 60 * 1000,
        retry: false,
    });
}

export function useLccaAnalysis(query: string) {
    return useQuery({...lccaAnalysisOptions(query), enabled: !!query.trim()});
}
