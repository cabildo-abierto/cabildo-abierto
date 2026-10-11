import {AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction} from '@/components/ui/alert-dialog';

export function TableChangeConfirmation({open, onCancel, onConfirm}: {open: boolean; onCancel: () => void; onConfirm: () => void}) {
    return <AlertDialog open={open} onOpenChange={open => {if (!open) onCancel();}}><AlertDialogContent>
        <AlertDialogHeader><AlertDialogTitle>¿Descartar contenido?</AlertDialogTitle><AlertDialogDescription>Este cambio va a eliminar el contenido de la tabla. Podés cancelar para conservarlo.</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter><AlertDialogCancel onClick={onCancel}>Cancelar</AlertDialogCancel><AlertDialogAction onClick={onConfirm}>Descartar y continuar</AlertDialogAction></AlertDialogFooter>
    </AlertDialogContent></AlertDialog>;
}
