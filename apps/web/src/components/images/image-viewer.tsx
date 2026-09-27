import {Dialog} from '@base-ui/react/dialog';
import {XIcon} from '@phosphor-icons/react';
import type {ImageContent} from '@cabildo-abierto/api';
import {Button} from '@/components/ui/button';
import {cn} from '@/lib/utils';
export function ImageViewer({value,url,open,onClose}: {value:ImageContent;url:string;open:boolean;onClose:()=>void}) {
    return <Dialog.Root open={open} onOpenChange={open=>{if(!open)onClose();}}><Dialog.Portal>
        <Dialog.Backdrop className={cn('fixed inset-0 z-50 bg-black/70')}/>
        <Dialog.Popup className={cn('fixed top-1/2 left-1/2 z-50 flex max-h-[90dvh] w-[calc(100vw-2rem)] max-w-6xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-lg bg-popover p-3 shadow-xl outline-none')}>
            <Dialog.Title className={cn('sr-only')}>Imagen ampliada</Dialog.Title>
            <Dialog.Close render={<Button variant="ghost" size="icon-sm"/>} aria-label="Cerrar imagen" className={cn('mb-2 self-end')}><XIcon/></Dialog.Close>
            <img src={url} alt={value.alt} className={cn('min-h-0 max-w-full flex-1 object-contain')} draggable={false}/>
            <Dialog.Description className={cn(value.caption?'mt-3 whitespace-pre-wrap text-sm text-muted-foreground':'sr-only')}>{value.caption||value.alt||'Vista ampliada de la imagen'}</Dialog.Description>
        </Dialog.Popup>
    </Dialog.Portal></Dialog.Root>;
}
