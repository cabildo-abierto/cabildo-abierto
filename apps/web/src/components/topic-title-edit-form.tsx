"use client";

import {useId, useState, type FormEvent} from "react";
import {useRouter} from "next/navigation";
import {useQueryClient} from "@tanstack/react-query";
import type {TopicSummary, CreateTopicTitleEditInput, TopicTitleEditOutput} from "@cabildo-abierto/api";
import {canonicalizeTopicId} from "@cabildo-abierto/utils";
import {PencilSimpleIcon} from "@phosphor-icons/react";
import {post} from "@/utils/react/fetch";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Label} from "@/components/ui/label";
import {AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogTrigger, AlertDialogCancel, AlertDialogFooter} from "@/components/ui/alert-dialog";

export function TopicTitleEditForm({topic}: {topic: TopicSummary}) {
    const fieldId = useId();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState(topic.title);
    const [message, setMessage] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const slug = canonicalizeTopicId(title);
    const submit = async (event: FormEvent) => {
        event.preventDefault();
        setSaving(true);
        setError(null);
        const result = await post<CreateTopicTitleEditInput, TopicTitleEditOutput>(`/topics/${encodeURIComponent(topic.id)}/edits`, {title: title.trim(), message: message.trim()});
        setSaving(false);
        if ("error" in result) { setError(result.error); return; }
        queryClient.setQueryData(["topic", topic.id], result.value.edit.topic);
        await queryClient.invalidateQueries({queryKey: ["topic-title-edits", topic.id]});
        setOpen(false);
        router.push(`/tema/${encodeURIComponent(result.value.edit.topic.slug)}/titulo#propuesta-${encodeURIComponent(result.value.edit.id)}`);
    };
    return <AlertDialog open={open} onOpenChange={value => {
        if (saving) return;
        setOpen(value);
        if (value) { setTitle(topic.title); setMessage(""); setError(null); }
    }}>
        <AlertDialogTrigger render={<Button size="sm"/>}><PencilSimpleIcon/>Proponer título</AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>Proponer título</AlertDialogTitle><AlertDialogDescription>Proponé un cambio de nombre para el tema.</AlertDialogDescription></AlertDialogHeader>
            <form onSubmit={event => void submit(event)} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor={`${fieldId}-title`}>Nuevo título</Label>
                    <Input id={`${fieldId}-title`} value={title} onChange={event => setTitle(event.target.value)} minLength={3} maxLength={120} required disabled={saving}/>
                </div>
                <p className="break-all text-xs text-muted-foreground">Nueva URL: /tema/{slug}</p>
                <div className="space-y-2">
                    <Label htmlFor={`${fieldId}-message`}>Motivo</Label>
                    <Textarea id={`${fieldId}-message`} value={message} onChange={event => setMessage(event.target.value)} maxLength={500} required disabled={saving}/>
                </div>
                {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={saving}>Cancelar</AlertDialogCancel>
                    <Button type="submit" disabled={saving || !slug || title.trim().length < 3 || title.trim() === topic.title || !message.trim()}>{saving ? "Confirmando…" : "Confirmar"}</Button>
                </AlertDialogFooter>
            </form>
        </AlertDialogContent>
    </AlertDialog>;
}
