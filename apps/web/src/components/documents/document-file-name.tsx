"use client";

import {useQuery} from "@tanstack/react-query";
import type {DocumentUploadOutput} from "@cabildo-abierto/api";
import {useAuth} from "@/components/auth-provider";
import {get} from "@/utils/react/fetch";
import {cn} from "@/lib/utils";

export function DocumentFileName({fileId}: {fileId: string}) {
    const {user} = useAuth();
    const query = useQuery({
        queryKey: ["document-file", fileId, user?.id],
        staleTime: Infinity,
        queryFn: async () => {
            const result = await get<Pick<DocumentUploadOutput, "fileId" | "fileName">>(`/document-files/${encodeURIComponent(fileId)}`);
            if ("error" in result) throw new Error(result.error);
            return result.value;
        },
    });
    return <p role={query.isError ? "alert" : "status"} className={cn("text-xs break-words", query.isError ? "text-destructive" : "text-muted-foreground")}>
        {query.data?.fileName ?? (query.isError ? "No pudimos obtener el nombre del archivo." : "Cargando nombre del archivo…")}
    </p>;
}
