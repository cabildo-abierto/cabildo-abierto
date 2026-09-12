"use client"

import Link from "next/link";
import type {BlockComment, TopicBlockVersion} from "@cabildo-abierto/api";
import {useState, type ReactNode} from "react";
import {ChatCircleIcon, DotsThreeIcon, FlagIcon, ShareNetworkIcon, TrashIcon, XIcon} from "@phosphor-icons/react";
import {useAuth} from "@/components/auth-provider";
import {Button} from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {formatRelativeDate, formatTopicBlockDate} from "@/components/topic-block-date";
import {Spinner} from "@/components/ui/spinner";
import {CommentComposer} from "@/components/comment-composer";

export function TopicBlockComments({comments, loading, error, filteredVersion, rejectionVersion, onShowAll, onPublish, onCancelRejection, onDelete}: {
    comments: BlockComment[] | null
    loading: boolean
    error: string | null
    filteredVersion: TopicBlockVersion | null
    rejectionVersion: TopicBlockVersion | null
    onShowAll: () => void
    onPublish: (content: string, replyToId?: string, blockVersionId?: string, reject?: boolean) => Promise<boolean>
    onCancelRejection: () => void
    onDelete: (commentId: string) => Promise<boolean>
}) {
    const {user, loading: authLoading} = useAuth();
    const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
    const visibleComments = filteredVersion ? comments?.filter(comment => comment.blockVersionId === filteredVersion.id) : comments;
    const commentsByParent = new Map<string, BlockComment[]>();
    for (const comment of visibleComments ?? []) {
        if (comment.replyToId === comment.blockVersionId) continue;
        const children = commentsByParent.get(comment.replyToId) ?? [];
        children.push(comment);
        commentsByParent.set(comment.replyToId, children);
    }
    const rootComments = (visibleComments ?? []).filter(comment => comment.replyToId === comment.blockVersionId);
    const hasVisibleDescendant = (commentId: string): boolean =>
        (commentsByParent.get(commentId) ?? []).some(child => !child.deleted || hasVisibleDescendant(child.id));
    const isRenderable = (comment: BlockComment) => !comment.deleted || hasVisibleDescendant(comment.id);

    const renderComment = (comment: BlockComment, depth: number): ReactNode => {
        const children = commentsByParent.get(comment.id) ?? [];
        const visibleChildren = children.filter(isRenderable);
        const isReplyEditorOpen = activeReplyId === comment.id;
        const cardClass = comment.rejection
            ? "border border-red-500/50 bg-red-500/5 dark:border-red-400/50 dark:bg-red-500/10"
            : `outline outline-1 -outline-offset-1 outline-[rgb(229_229_229)] dark:outline-[rgb(38_38_38)] ${depth % 2 === 1 ? "bg-card" : "bg-muted/40"}`;
        return <li key={comment.id} className={`pl-1 pt-1 pb-0.5 pr-0 rounded-lg ${cardClass}`}>

        {comment.deleted && <div className={"wrap-break-word p-1 leading-relaxed whitespace-pre-wrap flex items-center gap-1 italic text-xs py-2 text-muted-foreground"}>
            <div className={"pb-0.5"}>
                <TrashIcon className="size-3.5 shrink-0"/>
            </div>
            <div>
                Comentario eliminado
            </div>
        </div>}
        {!comment.deleted && <p className={"wrap-break-word p-1 text-xs leading-relaxed whitespace-pre-wrap"}>
            {comment.rejection && <XIcon className="mr-1 inline-block size-3.5 align-[-0.15em] text-red-600 dark:text-red-400" aria-label="Rechazo"/>}
            {comment.content}
        </p>}
        {!comment.deleted && <div className="flex pl-1 items-center gap-2 text-xs text-muted-foreground pr-1 pb-1">
            <span className="font-medium text-muted-foreground">@{comment.author.username}</span>
            <time dateTime={comment.createdAt} title={formatTopicBlockDate(comment.createdAt)}>{formatRelativeDate(comment.createdAt)}</time>
            {user && depth < 5 && <Button type="button" variant="ghost" size="sm" className="px-1 gap-0.5 text-muted-foreground"
                                          onClick={() => {activeReplyId == null ? setActiveReplyId(comment.id) : setActiveReplyId(null)}}
                                          aria-label={`Responder al comentario de @${comment.author.username} (${comment.directReplyCount} respuestas)`}
                                          title="Responder">
                <ChatCircleIcon className="size-3.5"/><span className="text-[10px] leading-none">{comment.directReplyCount}</span>
            </Button>}
            <DropdownMenu>
                <DropdownMenuTrigger render={<Button type="button" variant="ghost" size="icon-sm" className="ml-auto"/>}>
                    <DotsThreeIcon/>
                    <span className="sr-only">Acciones del comentario</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-max min-w-32">
                    <DropdownMenuItem className="whitespace-nowrap"><ShareNetworkIcon/>Compartir</DropdownMenuItem>
                    {user?.id !== comment.author.id && <DropdownMenuItem className="whitespace-nowrap"><FlagIcon/>Reportar</DropdownMenuItem>}
                    {user?.id === comment.author.id && <DropdownMenuItem variant="destructive" className="whitespace-nowrap" onClick={() => void onDelete(comment.id)}><TrashIcon/>Eliminar</DropdownMenuItem>}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>}
        {!comment.deleted && isReplyEditorOpen && <div className={"pb-1 pr-1"}>
            <CommentComposer replyTo={comment}
                             onPublish={(content, replyToId) => onPublish(content, replyToId, comment.blockVersionId)}
                             onCancel={() => setActiveReplyId(null)}/>
        </div>}
        {visibleChildren.length > 0 && <ol className="space-y-1">
            {visibleChildren.map(child => renderComment(child, depth + 1))}
        </ol>}
    </li>;
    };

    return <section className="mt-4 box-border min-w-0 max-w-full xl:absolute xl:top-0 xl:left-full xl:ml-32 xl:mt-0 xl:w-72" aria-label="Comentarios del bloque">
        {authLoading ? <p className="flex items-center gap-2 text-xs text-muted-foreground"><Spinner/>Comprobando sesión…</p> : user ? <CommentComposer
            rejectionLabel={rejectionVersion ? rejectionVersion.message
                ? `la edición «${rejectionVersion.message}» de @${rejectionVersion.author.username}`
                : `la edición de @${rejectionVersion.author.username} del ${formatTopicBlockDate(rejectionVersion.createdAt)}` : undefined}
            onPublish={(content, replyToId) => onPublish(content, replyToId, rejectionVersion?.id, Boolean(rejectionVersion))}
            onCancel={rejectionVersion ? onCancelRejection : undefined}/>: <p className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
            <Link href="/iniciar-sesion" className="font-medium text-foreground underline underline-offset-4">Iniciá sesión</Link> para escribir un comentario.
        </p>}
        <div className="mt-4">
            {filteredVersion && <div className="mb-3 text-[10px] text-muted-foreground">
                Viendo comentarios de la versión del {formatTopicBlockDate(filteredVersion.createdAt)} de @{filteredVersion.author.username}.{" "}
                <Button type="button" variant="link" size="xs" className="text-[10px] font-bold text-muted-foreground inline-flex h-auto px-0 align-baseline" onClick={onShowAll}>Ver todos</Button>
            </div>}
            {loading && <p className="flex items-center gap-2 text-xs text-muted-foreground" aria-live="polite"><Spinner/>Cargando comentarios…</p>}
            {error && <p className="text-xs text-destructive">{error}</p>}
            {rootComments.some(isRenderable) && <ol className="space-y-4">{rootComments.filter(isRenderable).map(comment => renderComment(comment, 1))}</ol>}
        </div>
    </section>;
}
