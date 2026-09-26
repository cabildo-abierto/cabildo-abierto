"use client";

import {useQuery} from "@tanstack/react-query";
import type {DocumentOutput} from "@cabildo-abierto/api";
import {useAuth} from "@/components/auth-provider";
import {get} from "@/utils/react/fetch";

export function useDocument(versionId: string, enabled = true) {
    const {user} = useAuth();
    return useQuery({
        enabled,
        queryKey: ["document-version", versionId, user?.id],
        queryFn: async () => {
            const result = await get<DocumentOutput>(`/document-versions/${encodeURIComponent(versionId)}`);
            if ("error" in result) throw new Error(result.error);
            return result.value;
        },
    });
}
