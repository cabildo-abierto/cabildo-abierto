"use client";

import {useRef, useState} from "react";
import {useQueryClient} from "@tanstack/react-query";
import type {CreateDiscussionCommentInput, TopicTitleEdit, TopicTitleEditOutput} from "@cabildo-abierto/api";
import {del, get, post} from "@/utils/react/fetch";

export function useTopicTitleEditActions(edit: TopicTitleEdit) {
    const queryClient = useQueryClient();
    const running = useRef(false);
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const base = `/topics/${encodeURIComponent(edit.topic.id)}/title-edits/${encodeURIComponent(edit.id)}`;
    const run = async (action: () => Promise<{success: boolean; error?: string}>) => {
        if (running.current) return false;
        running.current = true;
        setPending(true);
        setError(null);
        try {
            const result = await action();
            if (!result.success) { setError(result.error ?? "No pudimos completar la acción."); return false; }
            const updated = await get<TopicTitleEditOutput>(base);
            if ("error" in updated) {
                setError("La acción se guardó, pero no pudimos actualizar la edición.");
            } else {
                queryClient.setQueryData(["topic", edit.topic.id], updated.value.edit.topic);
            }
            await Promise.all([
                queryClient.invalidateQueries({queryKey: ["topic-title-edit", edit.topic.id, edit.id]}),
                queryClient.invalidateQueries({queryKey: ["topic-title-edits", edit.topic.id]}),
                queryClient.invalidateQueries({queryKey: ["topic", edit.topic.id]}),
            ]);
            return true;
        } catch {
            setError("No pudimos completar la acción. Volvé a intentarlo.");
            return false;
        } finally { running.current = false; setPending(false); }
    };
    return {
        pending, error,
        accept: () => run(() => post(`${base}/reactions`, {type: "accept"})),
        cancelReaction: (deleteReason: boolean) => run(() => del(`${base}/reactions`, {deleteReason})),
        deleteEdit: () => run(() => del(base)),
        publish: (input: CreateDiscussionCommentInput) => run(() => post(`${base}/comments`, input)),
        deleteComment: (id: string) => run(() => del(`${base}/comments/${encodeURIComponent(id)}`)),
    };
}
