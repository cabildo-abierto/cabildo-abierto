"use client";

import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function TopicEditCancelButton({disabled, requiresConfirmation, onCancel}: {
    disabled: boolean; requiresConfirmation: boolean; onCancel: () => void;
}) {
    const [open, setOpen] = useState(false);
    if (!requiresConfirmation) return <Button type="button" size="sm" variant="ghost" onClick={onCancel} disabled={disabled}>Cancelar</Button>;

    return <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger disabled={disabled} render={<Button type="button" size="sm" variant="ghost"/>}>Cancelar</AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>¿Descartar la edición múltiple?</AlertDialogTitle>
                <AlertDialogDescription>Vas a perder todos los cambios sin guardar de esta edición.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel disabled={disabled}>Seguir editando</AlertDialogCancel>
                <AlertDialogAction type="button" variant="destructive" disabled={disabled} onClick={() => {
                    setOpen(false);
                    onCancel();
                }}>Descartar cambios</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>;
}
