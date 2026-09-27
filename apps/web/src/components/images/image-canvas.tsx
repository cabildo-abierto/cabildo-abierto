"use client";
import {useState,type ReactNode} from 'react';
import type {ImageContent} from '@cabildo-abierto/api';
import {useImageAsset} from '@/hooks/use-image-asset';
import {Spinner} from '@/components/ui/spinner';
import {cn} from '@/lib/utils';
import {ImageResizeBorder} from './image-resize-border';
import {useImageSelection} from '@/hooks/use-image-selection';
import {ImageViewer} from './image-viewer';
export function ImageCanvas({value,preview=false,onWidthChange,disabled=false,interactive=true,selected:controlledSelected,onSelect,changeIndicator}: {value:ImageContent;preview?:boolean;onWidthChange?:(width:number)=>void;disabled?:boolean;interactive?:boolean;selected?:boolean;onSelect?:()=>void;changeIndicator?:ReactNode}) {
    const selection=useImageSelection();
    const selected=controlledSelected??selection.selected;
    const asset=useImageAsset(value.fileId);
    const [open,setOpen]=useState(false);
    const [failed,setFailed]=useState<string|null>(null);
    const [retried,setRetried]=useState<string|null>(null);
    if(asset.isPending)return <div role="status" aria-label="Cargando imagen" className={cn('flex min-h-24 justify-center items-center')}><Spinner/></div>;
    if(asset.error||!asset.data||failed===asset.data.url)return <p role="alert" className={cn('text-xs text-destructive')}>{asset.error?.message??'No pudimos mostrar la imagen.'}</p>;
    const enlarge=interactive&&!preview&&!onWidthChange;
    const image=<img src={asset.data.url} alt={value.alt} width={asset.data.width} height={asset.data.height} draggable={false}
        className={cn('block h-auto w-full rounded-md',preview&&'max-h-32 object-contain')}
        onError={()=>{
            if(retried!==value.fileId){setRetried(value.fileId);void asset.refetch().then(result=>{if(result.data?.url===asset.data!.url)setFailed(asset.data!.url);});}
            else setFailed(asset.data!.url);
        }}/>;
    return <figure className={cn('m-0 min-w-0 py-2')}>
        <div ref={selection.ref} className={cn('relative rounded-md',onWidthChange&&selected&&'ring-2 ring-primary')}>
            {changeIndicator}
            {enlarge?<button type="button" aria-label="Ampliar imagen" className={cn('block w-full cursor-zoom-in rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring')} onClick={()=>setOpen(true)}>{image}</button>:onWidthChange?<button type="button" aria-label="Seleccionar imagen" aria-pressed={selected} disabled={disabled} className={cn("block w-full rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring")} onClick={()=>{selection.select();onSelect?.();}}>{image}</button>:image}
            {onWidthChange&&selected&&<ImageResizeBorder value={value} onChange={onWidthChange} disabled={disabled}/>}
        </div>
        {value.caption&&<figcaption className={cn('mt-2 whitespace-pre-wrap text-xs text-muted-foreground wrap-anywhere',preview&&'line-clamp-2')}>{value.caption}</figcaption>}
        {enlarge&&<ImageViewer value={value} url={asset.data.url} open={open} onClose={()=>setOpen(false)}/>}
    </figure>;
}
