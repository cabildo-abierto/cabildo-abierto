"use client"

import Link from "next/link";
import type {BlockComment, TopicBlockVersion} from "@cabildo-abierto/api";
import {useState} from "react";
import {DotsThreeVerticalIcon, FlagIcon, KeyReturnIcon, ShareNetworkIcon, TrashIcon, XIcon} from "@phosphor-icons/react";
import {useAuth} from "@/components/auth-provider";
import {Button} from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Textarea} from "@/components/ui/textarea";
import {formatTopicBlockDate} from "@/components/topic-block-date";
import {Spinner} from "@/components/ui/spinner";

export function TopicBlockComments({comments, loading, error, filteredVersion, onShowAll, onPublish}: {
    comments: BlockComment[] | null
    loading: boolean
    error: string | null
    filteredVersion: TopicBlockVersion | null
    onShowAll: () => void
    onPublish: (content: string) => Promise<boolean>
}) {
    const {user, loading: authLoading} = useAuth();
    const [content, setContent] = useState("");
    const [publishing, setPublishing] = useState(false);
    const publish = async () => {
        setPublishing(true);
        const published = await onPublish(content);
        setPublishing(false);
        if (published) setContent("");
    };
    const visibleComments = filteredVersion ? comments?.filter(comment => comment.blockVersionId === filteredVersion.id) : comments;

    return <section className="mt-4 xl:absolute xl:top-0 xl:left-full xl:ml-32 xl:mt-0 xl:w-72" aria-label="Comentarios del bloque">
        {authLoading ? <p className="flex items-center gap-2 text-xs text-muted-foreground"><Spinner/>Comprobando sesión…</p> : user ? <div className="relative">
            <Textarea value={content} onChange={event => setContent(event.target.value)} placeholder="Escribí un comentario…"
                onKeyDown={event => {
                    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
                    event.preventDefault();
                    if (!publishing && content.trim()) void publish();
                }}
                maxLength={20_000} className="min-h-[3lh] resize-none pb-8"/>
            <div className="absolute right-1 bottom-1 flex items-center gap-1">
                <Button type="button" variant="ghost" size="icon-lg" className="size-7 p-0"
                    onClick={() => setContent("")} disabled={publishing || !content}
                    aria-label="Cancelar comentario" title="Cancelar">
                    <XIcon className="size-3"/>
                </Button>
                <Button type="button" variant="ghost" size="icon-lg"
                    className="size-7 rounded-md p-0 hover:bg-muted dark:hover:bg-muted/50 [&_svg]:size-5"
                    onClick={() => void publish()} disabled={publishing || !content.trim()}
                    aria-label={publishing ? "Publicando comentario" : "Publicar comentario"} title="Publicar">
                    <KeyReturnIcon/>
                </Button>
            </div>
        </div> : <p className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
            <Link href="/iniciar-sesion" className="font-medium text-foreground underline underline-offset-4">Iniciá sesión</Link> para escribir un comentario.
        </p>}
        <div className="mt-4">
            {filteredVersion && <div className="mb-3 text-[10px] text-muted-foreground">
                Viendo comentarios de la versión del {formatTopicBlockDate(filteredVersion.createdAt)} por @{filteredVersion.author.username}{" "}
                <Button type="button" variant="link" size="xs" className="inline-flex h-auto px-0 align-baseline text-[inherit]" onClick={onShowAll}>Ver todos</Button>
            </div>}
            {loading && <p className="flex items-center gap-2 text-xs text-muted-foreground" aria-live="polite"><Spinner/>Cargando comentarios…</p>}
            {error && <p className="text-xs text-destructive">{error}</p>}
            {visibleComments && visibleComments.length > 0 && <ol className="space-y-4">
                {visibleComments.map(comment => <li key={comment.id} className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-medium text-muted-foreground">@{comment.author.username}</span>
                        <time dateTime={comment.createdAt}>{formatTopicBlockDate(comment.createdAt)}</time>
                        <DropdownMenu>
                            <DropdownMenuTrigger render={<Button type="button" variant="ghost" size="icon-sm" className="ml-auto"/>}>
                                <DotsThreeVerticalIcon/>
                                <span className="sr-only">Acciones del comentario</span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-max min-w-32">
                                <DropdownMenuItem className="whitespace-nowrap">
                                    <ShareNetworkIcon/>
                                    Compartir
                                </DropdownMenuItem>
                                {user?.id !== comment.author.id && <DropdownMenuItem className="whitespace-nowrap">
                                    <FlagIcon/>
                                    Reportar
                                </DropdownMenuItem>}
                                {user?.id === comment.author.id && <DropdownMenuItem variant="destructive" className="whitespace-nowrap">
                                    <TrashIcon/>
                                    Eliminar
                                </DropdownMenuItem>}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                </li>)}
            </ol>}
        </div>
    </section>;
}
