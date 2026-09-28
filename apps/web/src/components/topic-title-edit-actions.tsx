"use client";

import {useState, type ReactNode} from "react";
import type {TopicTitleEdit} from "@cabildo-abierto/api";
import {CheckIcon, DotsThreeIcon, TrashIcon, XIcon} from "@phosphor-icons/react";
import {useAuth} from "@/components/auth-provider";
import {Button} from "@/components/ui/button";
import {AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction} from "@/components/ui/alert-dialog";
import {DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem} from "@/components/ui/dropdown-menu";
import {cn} from "@/lib/utils";
import {Spinner} from "@/components/ui/spinner";

export function TopicTitleEditActions({edit, pending, pendingVote, onAccept, onReject, onCancelReaction, onDelete, children}: {
    children: ReactNode;
    edit: TopicTitleEdit; pending: boolean; pendingVote: "accept" | "reject" | null; onAccept: (deleteReason?: boolean) => Promise<boolean>; onReject: () => void;
    onCancelReaction: (deleteReason: boolean) => Promise<boolean>; onDelete: () => Promise<boolean>;
}) {
    const {user} = useAuth();
    const [dialog, setDialog] = useState<"delete" | "cancel" | "switch" | null>(null);
    const disabled = pending || !user || user.id === edit.author.id;
    const canReact = !edit.initial && edit.status !== "deleted";
    return <>
        <div className="flex flex-wrap items-center gap-2">
            {canReact && <><Button variant="ghost" size="sm" disabled={disabled} aria-pressed={edit.userReaction === "accept"} aria-busy={pendingVote === "accept"}
                aria-label={edit.userReaction === "accept" ? "Cancelar aceptación" : "Aceptar"}
                title={`${edit.userReaction === "accept" ? "Cancelar aceptación" : "Aceptar"} · ${edit.acceptCount} aceptaciones`}
                className={cn("pl-0 text-green-600 hover:bg-green-500/10 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300", edit.userReaction === "accept" && "bg-green-500/15")}
                onClick={() => {
                    if (edit.userReaction === "reject") setDialog("switch");
                    else void (edit.userReaction === "accept" ? onCancelReaction(false) : onAccept());
                }}>
                {pendingVote === "accept" ? <Spinner/> : <CheckIcon/>}<span className="tabular-nums">{edit.acceptCount}</span>
            </Button>
            <Button variant="ghost" size="sm" disabled={disabled} aria-pressed={edit.userReaction === "reject"} aria-busy={pendingVote === "reject"}
                aria-label={edit.userReaction === "reject" ? "Cancelar rechazo" : "Rechazar"}
                title={`${edit.userReaction === "reject" ? "Cancelar rechazo" : "Rechazar"} · ${edit.rejectCount} rechazos`}
                className={cn("pl-0 text-red-600 hover:bg-red-500/10 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300", edit.userReaction === "reject" && "bg-red-500/15")}
                onClick={() => edit.userReaction === "reject" ? setDialog("cancel") : onReject()}>
                {pendingVote === "reject" ? <Spinner/> : <XIcon/>}<span className="tabular-nums">{edit.rejectCount}</span>
            </Button>
            {edit.replicatedRejectCount > 0 && <span className="text-xs text-muted-foreground">{edit.replicatedRejectCount} rechazos replicados</span>}
            </>}
            {children}
            {canReact && user?.id === edit.author.id && <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" className="absolute top-0 right-0 text-muted-foreground" disabled={pending} aria-label="Acciones de la propuesta"/>}>
                    <DotsThreeIcon/>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-max">
                    <DropdownMenuItem variant="destructive" className="whitespace-nowrap" disabled={pending} onClick={() => setDialog("delete")}>
                        <TrashIcon/>Eliminar propuesta
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>}
        </div>
        <AlertDialog open={dialog !== null} onOpenChange={open => { if (!open && !pending) setDialog(null); }}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{dialog === "delete" ? "Eliminar propuesta de título" : dialog === "switch" ? "Cambiar a aceptación" : "Cancelar rechazo"}</AlertDialogTitle>
                    <AlertDialogDescription>{dialog === "delete"
                        ? "Se va a eliminar la propuesta y su discusión asociada."
                        : "¿Querés borrar también la justificación o conservarla como comentario?"}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className={cn(dialog !== "delete" && "w-full sm:flex-col")}>
                    <AlertDialogCancel className={cn(dialog !== "delete" && "w-full")} disabled={pending}>Cancelar</AlertDialogCancel>
                    {dialog !== "delete" && <AlertDialogAction className="w-full" disabled={pending} onClick={async () => {
                        if (await (dialog === "switch" ? onAccept(false) : onCancelReaction(false))) setDialog(null);
                    }}>Conservar comentario</AlertDialogAction>}
                    <AlertDialogAction className={cn(dialog !== "delete" && "w-full")} variant="destructive" disabled={pending} onClick={async () => {
                        if (await (dialog === "delete" ? onDelete() : dialog === "switch" ? onAccept(true) : onCancelReaction(true))) setDialog(null);
                    }}>{dialog === "delete" ? "Eliminar" : "Borrar justificación"}</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>;
}
