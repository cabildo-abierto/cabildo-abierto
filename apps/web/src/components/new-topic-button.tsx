"use client";

import Link from "next/link";
import {PlusIcon} from "@phosphor-icons/react";
import {useAuth} from "@/components/auth-provider";
import {Button} from "@/components/ui/button";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function NewTopicButton() {
    const {user, loading} = useAuth();
    const label = <><PlusIcon/>Nuevo tema</>;
    if (user) return <Button nativeButton={false} render={<Link href="/nuevo-tema"/>} variant="ghost" size="sm">{label}</Button>;
    return <AlertDialog>
        <AlertDialogTrigger disabled={loading} render={<Button type="button" variant="ghost" size="sm"/>}>{label}</AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Iniciá sesión</AlertDialogTitle>
                <AlertDialogDescription>Creá una cuenta o iniciá sesión para crear un nuevo tema.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction nativeButton={false} render={<Link href="/iniciar-sesion"/>}>Iniciar sesión</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>;
}
