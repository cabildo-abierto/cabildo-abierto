"use client";
import {useRef,useState} from 'react';
import {Dialog} from '@base-ui/react/dialog';
import {ImageIcon,XIcon} from '@phosphor-icons/react';
import type {ImageContent,ImageAssetOutput} from '@cabildo-abierto/api';
import {parseImageBlock} from '@cabildo-abierto/utils';
import {dataViewRequest} from '@/utils/react/data-view-request';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {ScrollArea} from '@/components/ui/scroll-area';
import {Spinner} from '@/components/ui/spinner';
import {cn} from '@/lib/utils';
import {ImageCanvas} from './image-canvas';
import {ImageBlockFrame} from './image-block-frame';
import {TopicContentFlow} from './topic-content-flow';

export function ImageEditorPopup({topicId,initialContent,onConfirm,onClose}: {topicId:string;initialContent?:string;onConfirm:(content:string)=>void;onClose:()=>void}) {
    const [value,setValue]=useState<ImageContent>(()=>parseImageBlock(initialContent??'')??{fileId:'',widthPercent:100,alignment:'center',flow:'separate',alt:'',caption:''});
    const [mode,setMode]=useState<'upload'|'import'>('upload');
    const [url,setUrl]=useState('');
    const [busy,setBusy]=useState(false);
    const [error,setError]=useState<string|null>(null);
    const input=useRef<HTMLInputElement>(null);
    const load=async(file?:File)=>{
        setBusy(true);setError(null);
        try {
            const output=await dataViewRequest<Omit<ImageAssetOutput,'url'|'expiresAt'>>('/topics/'+encodeURIComponent(topicId)+'/images/'+(file?'upload':'import'),{
                method:'POST',headers:{'Content-Type':file?'application/octet-stream':'application/json'},body:file??JSON.stringify({url})});
            setValue(current=>({...current,fileId:output.fileId}));
        } catch(cause){setError(cause instanceof Error?cause.message:'No pudimos cargar esa imagen.');}
        finally {setBusy(false);}
    };
    return <Dialog.Root open disablePointerDismissal onOpenChange={open=>{if(!open&&!busy)onClose();}}><Dialog.Portal>
        <Dialog.Backdrop data-attachment-editor-popup className={cn('fixed inset-0 z-50 bg-black/40')}/>
        <Dialog.Popup data-attachment-editor-popup className={cn('fixed top-1/2 left-1/2 z-50 flex max-h-[90dvh] w-[calc(100vw-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border bg-popover shadow-xl outline-none')}>
            <header className={cn('flex shrink-0 items-center gap-2 border-b px-4 py-3')}><ImageIcon/><Dialog.Title className={cn('flex-1 text-sm font-medium')}>{initialContent?'Editar':'Insertar'} imagen</Dialog.Title><Dialog.Close render={<Button variant="ghost" size="icon-sm" disabled={busy}/>} aria-label="Cerrar"><XIcon/></Dialog.Close></header>
            <Dialog.Description className={cn('sr-only')}>Elegí una imagen y configurá cómo se muestra en el tema.</Dialog.Description>
            <ScrollArea className={cn('min-h-0 flex-1')} viewportClassName={cn('max-h-[calc(90dvh-8rem)]')}><div className={cn('space-y-4 p-4')}>
                <div className={cn('flex gap-2')}><Button variant={mode==='upload'?'secondary':'ghost'} size="sm" disabled={busy} onClick={()=>setMode('upload')}>Archivo</Button><Button variant={mode==='import'?'secondary':'ghost'} size="sm" disabled={busy} onClick={()=>setMode('import')}>Importar desde URL</Button></div>
                {mode==='upload'?<><input ref={input} type="file" accept="image/png,image/jpeg,image/webp" className={cn('hidden')} onChange={event=>{const file=event.target.files?.[0];if(file)void load(file);event.target.value='';}}/><Button variant="outline" size="sm" disabled={busy} onClick={()=>input.current?.click()}>{value.fileId?'Reemplazar imagen':'Elegir imagen'}</Button></>:<div className={cn('flex gap-2')}><Input type="url" aria-label="URL de la imagen" placeholder="https://…" value={url} disabled={busy} onChange={event=>setUrl(event.target.value)}/><Button size="sm" disabled={busy||!/^https?:\/\//i.test(url)} onClick={()=>void load()}>Importar</Button></div>}
                {busy&&<div role="status" aria-label="Preparando imagen" className={cn('flex justify-center py-4')}><Spinner/></div>}
                {error&&<p role="alert" className={cn('text-xs text-destructive')}>{error}</p>}
                <Input aria-label="Texto alternativo" placeholder="Texto alternativo (opcional)" maxLength={1000} value={value.alt} disabled={busy} onChange={event=>setValue({...value,alt:event.target.value})}/>
                <Textarea aria-label="Epígrafe" placeholder="Epígrafe (opcional)" maxLength={5000} value={value.caption} disabled={busy} onChange={event=>setValue({...value,caption:event.target.value})}/>
                {value.fileId&&<TopicContentFlow className={cn('rounded-md border p-3')}><ImageBlockFrame value={value}><ImageCanvas key={value.fileId} value={value} onWidthChange={widthPercent=>setValue(current=>({...current,widthPercent}))} disabled={busy}/></ImageBlockFrame></TopicContentFlow>}
            </div></ScrollArea>
            <footer className={cn('flex shrink-0 justify-end gap-2 border-t px-4 py-3')}><Button variant="outline" size="sm" disabled={busy} onClick={onClose}>Cancelar</Button><Button size="sm" disabled={busy||!parseImageBlock(JSON.stringify(value))} onClick={()=>onConfirm(JSON.stringify(value))}>{initialContent?'Confirmar cambios':'Agregar imagen'}</Button></footer>
        </Dialog.Popup>
    </Dialog.Portal></Dialog.Root>;
}
