"use client"

import Link from "next/link";
import type {DiscussionComment, TopicBlockVersion} from "@cabildo-abierto/api";
import {useState, type ReactNode} from "react";
import {ChatCircleIcon, CheckIcon, DotsThreeIcon, FlagIcon, ShareNetworkIcon, TrashIcon, XIcon} from "@phosphor-icons/react";
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
import {cn} from "@/lib/utils";
import {topicAuthorName} from "@/components/topic-author-name";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {ScrollArea} from "@/components/ui/scroll-area";

const MAX_INLINE_COMMENT_DEPTH = 5;

export function DiscussionComments({comments, loading, error, filteredVersion, pinnedVersionId, rejectionVersion, conversationHref, pageLayout = false, onShowAll, onPublish, onCancelRejection, onDelete, scope = "block", readOnly = false}: {
    scope?: "block" | "title"
    readOnly?: boolean
    comments: DiscussionComment[] | null
    loading: boolean
    error: string | null
    filteredVersion: Pick<TopicBlockVersion, "id" | "createdAt" | "author"> | null
    pinnedVersionId?: string | null
    rejectionVersion: Pick<TopicBlockVersion, "id" | "message" | "createdAt" | "author"> | null
    conversationHref: string
    pageLayout?: boolean
    onShowAll: () => void
    onPublish: (content: string, replyToId?: string, rootId?: string, reject?: boolean, replica?: boolean) => Promise<boolean>
    onCancelRejection: () => void
    onDelete: (commentId: string) => Promise<boolean>
}) {
    const {user, loading: authLoading} = useAuth();
    const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
    const [activeReplicaId, setActiveReplicaId] = useState<string | null>(null);
    const [deleteComment, setDeleteComment] = useState<DiscussionComment | null>(null);
    const visibleComments = filteredVersion ? comments?.filter(comment => comment.rootId === filteredVersion.id) : comments;
    const commentsByParent = new Map<string, DiscussionComment[]>();
    for (const comment of visibleComments ?? []) {
        if (comment.replyToId === comment.rootId) continue;
        const children = commentsByParent.get(comment.replyToId) ?? [];
        children.push(comment);
        commentsByParent.set(comment.replyToId, children);
    }
    const rootComments = (visibleComments ?? []).filter(comment => comment.replyToId === comment.rootId);
    const hasVisibleDescendant = (commentId: string): boolean =>
        (commentsByParent.get(commentId) ?? []).some(child => !child.deleted || hasVisibleDescendant(child.id));
    const isRenderable = (comment: DiscussionComment) => !comment.deleted || hasVisibleDescendant(comment.id);

    const renderComment = (comment: DiscussionComment, depth: number): ReactNode => {
        const children = commentsByParent.get(comment.id) ?? [];
        const visibleChildren = children.filter(isRenderable);
        const displayedChildren = pageLayout || depth < MAX_INLINE_COMMENT_DEPTH ? visibleChildren : [];
        const isReplyEditorOpen = activeReplyId === comment.id;
        const isReplicaEditorOpen = activeReplicaId === comment.id;
        const hasHiddenReplies = !pageLayout && depth >= MAX_INLINE_COMMENT_DEPTH && visibleChildren.length > 0;
        const userAlreadyReplicated = Boolean(user && children.some(child =>
            !child.deleted && child.suggestedVote !== null && child.author.id === user.id));
        const cardClass = cn(
            comment.suggestedVote === "reject" && "border border-red-500/50 bg-red-500/5 dark:border-red-400/50 dark:bg-red-500/10",
            comment.suggestedVote === "accept" && "border border-green-500/50 bg-green-500/5 dark:border-green-400/50 dark:bg-green-500/10",
            comment.suggestedVote === null && "outline outline-1 -outline-offset-1 outline-[rgb(229_229_229)] dark:outline-[rgb(38_38_38)]",
            comment.suggestedVote === null && (depth % 2 === 1 ? "bg-card" : "bg-muted/40"),
        );
        return <li key={comment.id} className={cn("pl-1 pt-1 pb-0.5 pr-0 rounded-lg", cardClass)}>

        {comment.deleted && <div className={"wrap-break-word p-1 leading-relaxed whitespace-pre-wrap flex items-center gap-1 italic text-xs py-2 text-muted-foreground"}>
            <div className={"pb-0.5"}>
                <TrashIcon className="size-3.5 shrink-0"/>
            </div>
            <div>
                Comentario eliminado
            </div>
        </div>}
        {!comment.deleted && <p className={"wrap-break-word p-1 text-xs leading-relaxed whitespace-pre-wrap"}>
            {comment.suggestedVote === "reject" && <XIcon className="mr-1 inline-block size-3.5 align-[-0.15em] text-red-600 dark:text-red-400" aria-label="Sugiere rechazar"/>}
            {comment.suggestedVote === "accept" && <CheckIcon className="mr-1 inline-block size-3.5 align-[-0.15em] text-green-700 dark:text-green-400" aria-label="Sugiere aceptar"/>}
            {comment.content}
        </p>}
        {!comment.deleted && <div className="flex pl-1 items-center gap-2 text-xs text-muted-foreground pr-1 pb-1">
            <span className="font-medium text-muted-foreground">{topicAuthorName(comment.author, user?.id)}</span>
            <time dateTime={comment.createdAt} title={formatTopicBlockDate(comment.createdAt)}>{formatRelativeDate(comment.createdAt)}</time>
            {!readOnly && user && <Button type="button" variant="ghost" size="sm" className="px-1 gap-0.5 text-muted-foreground"
                                          onClick={() => { setActiveReplicaId(null); setActiveReplyId(activeReplyId === comment.id ? null : comment.id); }}
                                          aria-label={`Responder al comentario de ${topicAuthorName(comment.author, user?.id)} (${comment.directReplyCount} respuestas)`}
                                          title="Responder">
                <ChatCircleIcon className="size-3.5"/><span className="text-[10px] leading-none">{comment.directReplyCount}</span>
            </Button>}
            {!readOnly && user && comment.suggestedVote !== null && user.id !== comment.author.id && !userAlreadyReplicated && <Button
                type="button" variant="outline" size="xs"
                className="bg-muted/50 px-2 text-[10px] text-foreground hover:bg-muted"
                onClick={() => { setActiveReplyId(null); setActiveReplicaId(activeReplicaId === comment.id ? null : comment.id); }}
                aria-label={`Replicar el voto de ${topicAuthorName(comment.author, user?.id)}`} title="Réplica">
                Réplica
            </Button>}
            <DropdownMenu>
                <DropdownMenuTrigger render={<Button type="button" variant="ghost" size="icon-sm" className="ml-auto"/>}>
                    <DotsThreeIcon/>
                    <span className="sr-only">Acciones del comentario</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-max min-w-32">
                    <DropdownMenuItem className="whitespace-nowrap"><ShareNetworkIcon/>Compartir</DropdownMenuItem>
                    {user?.id !== comment.author.id && <DropdownMenuItem className="whitespace-nowrap"><FlagIcon/>Reportar</DropdownMenuItem>}
                    {!readOnly && user?.id === comment.author.id && <DropdownMenuItem variant="destructive" className="whitespace-nowrap" onClick={() => setDeleteComment(comment)}><TrashIcon/>Eliminar</DropdownMenuItem>}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>}
        {!readOnly && !comment.deleted && isReplyEditorOpen && <div className={"pb-1 pr-1"}>
            <CommentComposer replyTo={comment}
                             onPublish={(content, replyToId) => onPublish(content, replyToId, comment.rootId)}
                             onCancel={() => setActiveReplyId(null)}/>
        </div>}
        {!readOnly && !comment.deleted && isReplicaEditorOpen && <div className="pb-1 pr-1">
            <CommentComposer replyTo={comment}
                             replicaVote={comment.suggestedVote === "reject" ? "accept" : "reject"}
                             onPublish={(content, replyToId) => onPublish(content, replyToId, comment.rootId, false, true)}
                             onCancel={() => setActiveReplicaId(null)}/>
        </div>}
        {!comment.deleted && hasHiddenReplies && <Button nativeButton={false} render={<Link href={conversationHref}/>} variant="outline" size="xs" className="mx-1 mb-1 text-muted-foreground">
            Ver conversación completa
        </Button>}
        {displayedChildren.length > 0 && <ol className="space-y-1">
            {displayedChildren.map(child => renderComment(child, depth + 1))}
        </ol>}
    </li>;
    };

    return <><section className={cn("mt-4 box-border min-w-0 max-w-full")} aria-label={scope === "title" ? "Comentarios del título" : "Comentarios del bloque"}>
        {readOnly ? <p className="text-xs text-muted-foreground">La discusión de esta edición eliminada está cerrada.</p> : authLoading ? <p className="flex items-center gap-2 text-xs text-muted-foreground"><Spinner/>Comprobando sesión…</p> : user ? <CommentComposer
            rejectionLabel={rejectionVersion ? rejectionVersion.message
                ? `${scope === "title" ? "la edición de título" : "la edición"} «${rejectionVersion.message}» de ${topicAuthorName(rejectionVersion.author, user?.id)}`
                : `la edición de ${topicAuthorName(rejectionVersion.author, user?.id)} del ${formatTopicBlockDate(rejectionVersion.createdAt)}` : undefined}
            onPublish={(content, replyToId) => onPublish(content, replyToId, rejectionVersion?.id, Boolean(rejectionVersion))}
            onCancel={rejectionVersion ? onCancelRejection : undefined}/>: <p className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
            <Link href="/iniciar-sesion" className="font-medium text-foreground underline underline-offset-4">Iniciá sesión</Link> para escribir un comentario.
        </p>}
        <div className={cn("mt-2", scope !== "title" && "mb-16")}>
            {filteredVersion && <div className={cn("mb-3 text-muted-foreground", pageLayout ? "text-xs" : "text-[10px]")}>
                Viendo comentarios de la versión del {formatTopicBlockDate(filteredVersion.createdAt)} de {topicAuthorName(filteredVersion.author, user?.id)}.{" "}
                {pinnedVersionId === filteredVersion.id && <Button type="button" variant="link" size="xs" className={cn("font-bold text-muted-foreground inline-flex h-auto px-0 align-baseline", pageLayout ? "text-xs" : "text-[10px]")} onClick={onShowAll}>Ver todos</Button>}
            </div>}
            {loading && <p className="flex items-center gap-2 text-xs text-muted-foreground" aria-live="polite"><Spinner/>Cargando comentarios…</p>}
            {error && <p className="text-xs text-destructive">{error}</p>}
            {rootComments.some(isRenderable) && <ScrollArea className={cn("group/comment-scroll max-h-[600px]")}>
                <ol className={cn("space-y-2 group-data-[has-overflow-y]/comment-scroll:pr-3")}>{rootComments.filter(isRenderable).map(comment => renderComment(comment, 1))}</ol>
            </ScrollArea>}
            {pageLayout && !loading && !error && !rootComments.some(isRenderable) && <p className={cn("text-xs text-muted-foreground", scope === "title" ? "py-1" : "rounded-md bg-muted/40 p-3")}>
                {filteredVersion ? "Esta versión no recibió comentarios." : scope === "title" ? "La propuesta todavía no recibió comentarios." : "Todavía no recibió comentarios."}
            </p>}
        </div>
    </section>
        <AlertDialog open={Boolean(deleteComment)} onOpenChange={open => {
            if (!open) setDeleteComment(null);
        }}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Eliminar comentario</AlertDialogTitle>
                    <AlertDialogDescription>El comentario aparecerá como eliminado. Esta acción no se puede deshacer.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction variant="destructive" onClick={async () => {
                        if (deleteComment && await onDelete(deleteComment.id)) setDeleteComment(null);
                    }}>Eliminar</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>;
}
