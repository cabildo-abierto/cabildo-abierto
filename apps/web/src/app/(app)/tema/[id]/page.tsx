"use client"

import Link from "next/link";
import {useParams} from "next/navigation";
import {useQuery} from "@tanstack/react-query";
import {useState} from "react";
import type {TopicBlocksOutput, TopicOutput} from "@cabildo-abierto/api";
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
import {Spinner} from "@/components/ui/spinner";
import {useIsMobile} from "@/hooks/use-is-mobile";

export default function TopicPage() {
    const {id} = useParams<{id: string}>();
    const {user, loading: authLoading} = useAuth();
    const isMobile = useIsMobile();
    const [openCommentsBlockId, setOpenCommentsBlockId] = useState<string | null>(null);
    const [openHistoryBlockId, setOpenHistoryBlockId] = useState<string | null>(null);
    const topicQuery = useQuery({
        queryKey: ["topic", id],
        queryFn: async () => {
            const result = await get<TopicOutput>(`/topics/${encodeURIComponent(id)}`);
            if ("error" in result) throw new Error(result.error);
            return result.value.topic;
        },
    });
    const blocksQuery = useQuery({
        queryKey: ["topic", id, "blocks"],
        queryFn: async () => {
            const result = await get<TopicBlocksOutput>(`/topics/${encodeURIComponent(id)}/blocks`);
            if ("error" in result) throw new Error(result.error);
            return result.value.blocks;
        },
    });
    const topic = topicQuery.data;
    const blocks = blocksQuery.data ?? [];
    const error = topicQuery.error instanceof Error ? topicQuery.error.message : blocksQuery.error instanceof Error ? blocksQuery.error.message : null;

    if (error) return <div className="mx-auto max-w-2xl p-6 text-sm text-destructive">{error}</div>;
    if (topicQuery.isPending || blocksQuery.isPending || !topic) return <div
        className="flex items-center flex-col gap-7 justify-center h-screen fixed top-0 left-1/2 -translate-x-1/2 p-6 text-sm text-muted-foreground"
    >
        <Spinner className={"size-7"}/>
        Cargando tema...
    </div>;

    const editButton = isMobile === false && (user ? <Button nativeButton={false} render={<Link href={`/tema/${encodeURIComponent(topic.id)}/editar`}/>} variant="outline" size="sm">
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
    </AlertDialog>);

    return <TopicView topic={topic} connectionMode="reading" action={editButton}>
        {blocks.length === 0 ? <p className="py-2 text-sm text-muted-foreground">Este tema está vacío.</p> : <div>{blocks.map(block => <TopicBlockView
                key={block.id}
                topicId={topic.id}
                block={block}
                openInPage={isMobile === true}
                commentsOpen={openCommentsBlockId === block.id}
                onCommentsOpenChange={open => setOpenCommentsBlockId(open ? block.id : null)}
                historyOpen={openHistoryBlockId === block.id}
                onHistoryOpenChange={open => setOpenHistoryBlockId(open ? block.id : null)}
                onSectionOpen={section => {
                    if (section === "comments") setOpenHistoryBlockId(null);
                    else setOpenCommentsBlockId(null);
                }}
            />)}</div>}
    </TopicView>;
}
