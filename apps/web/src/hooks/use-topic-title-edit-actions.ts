"use client";

import {useRef, useState} from "react";
import {useQueryClient} from "@tanstack/react-query";
import type {CreateDiscussionCommentInput, TopicTitleEdit, TopicTitleEditOutput} from "@cabildo-abierto/api";
import {del, get, post} from "@/utils/react/fetch";
import {useToast} from "@/components/ui/toast";

export function useTopicTitleEditActions(edit: TopicTitleEdit) {
    const queryClient = useQueryClient();
    const {toast} = useToast();
    const running = useRef(false);
    const [pending, setPending] = useState(false);
    const [pendingVote, setPendingVote] = useState<"accept" | "reject" | null>(null);
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
    const vote = async (type: "accept" | "reject", cancel: boolean, action: () => Promise<{success: boolean; error?: string}>) => {
        if (running.current) return false;
        setPendingVote(type);
        try {
            const saved = await run(action);
            if (saved) toast({title: cancel ? "Se canceló el voto" : "Se registró el voto"});
            return saved;
        } finally {
            setPendingVote(null);
        }
    };
    return {
        pending, pendingVote, error,
        accept: (deleteReason?: boolean) => vote("accept", false, () => post(`${base}/reactions`, {type: "accept", deleteReason})),
        cancelReaction: (deleteReason: boolean) => vote(edit.userReaction === "accept" ? "accept" : "reject", true, () => del(`${base}/reactions`, {deleteReason})),
        deleteEdit: () => run(() => del(base)),
        publish: async (input: CreateDiscussionCommentInput) => {
            const saved = await run(() => post(`${base}/comments`, input));
            if (saved) toast({title: input.reject || input.replica ? "Se registró el voto" : "Se publicó el comentario"});
            return saved;
        },
        deleteComment: (id: string) => run(() => del(`${base}/comments/${encodeURIComponent(id)}`)),
    };
}
