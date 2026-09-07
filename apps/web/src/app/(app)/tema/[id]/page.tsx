"use client"

import Link from "next/link";
import {useParams} from "next/navigation";
import {useEffect, useState} from "react";
import type {TopicBlock, TopicBlocksOutput, TopicOutput, TopicSummary} from "@cabildo-abierto/api";
import {PencilSimpleIcon} from "@phosphor-icons/react";
import {Button} from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {TopicView} from "@/components/topic-view";
import {TopicBlockView} from "@/components/topic-block";
import {useAuth} from "@/components/auth-provider";
import {get} from "@/utils/react/fetch";

export default function TopicPage() {
    const {id} = useParams<{id: string}>();
    const {user, loading: authLoading} = useAuth();
    const [topic, setTopic] = useState<TopicSummary | null>(null);
    const [blocks, setBlocks] = useState<TopicBlock[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let current = true;
        void Promise.all([
            get<TopicOutput>(`/topics/${encodeURIComponent(id)}`),
            get<TopicBlocksOutput>(`/topics/${encodeURIComponent(id)}/blocks`),
        ]).then(([topicResult, blocksResult]) => {
            if (!current) return;
            if ("error" in topicResult) setError(topicResult.error);
            else if ("error" in blocksResult) setError(blocksResult.error);
            else {
                setTopic(topicResult.value.topic);
                setBlocks(blocksResult.value.blocks);
            }
        });
        return () => { current = false; };
    }, [id]);

    if (error) return <div className="mx-auto max-w-2xl p-6 text-sm text-destructive">{error}</div>;
    if (!topic) return <div className="mx-auto max-w-2xl p-6 text-sm text-muted-foreground">Cargando tema…</div>;

    const editButton = user ? <Button nativeButton={false} render={<Link href={`/tema/${encodeURIComponent(topic.id)}/editar`}/>} variant="outline" size="sm">
        <PencilSimpleIcon/>
        Editar
    </Button> : <AlertDialog>
        <AlertDialogTrigger render={<Button variant="outline" size="sm" disabled={authLoading}/> }>
            <PencilSimpleIcon/>
            Editar
        </AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Iniciá sesión para editar</AlertDialogTitle>
                <AlertDialogDescription>Necesitás una cuenta para editar el contenido de un tema.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <Button nativeButton={false} render={<Link href="/iniciar-sesion"/>}>Iniciar sesión</Button>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>;

    return <TopicView topic={topic} action={editButton}>
        <div className="space-y-2">{blocks.map(block => <TopicBlockView key={block.id} topicId={topic.id} block={block}/>)}</div>
    </TopicView>;
}
