"use client";
import type {TopicBlock} from '@cabildo-abierto/api';
import {parseImageBlock} from '@cabildo-abierto/utils';
import {cn} from '@/lib/utils';
import {ImageCanvas} from './image-canvas';
export function ImageBlock({block,preview=false}: {block:TopicBlock;preview?:boolean}) {
    const value=parseImageBlock(block.content);
    return value?<ImageCanvas key={value.fileId} value={value} preview={preview}/>:<p role="alert" className={cn('text-xs text-destructive')}>La configuración de la imagen no es válida.</p>;
}
