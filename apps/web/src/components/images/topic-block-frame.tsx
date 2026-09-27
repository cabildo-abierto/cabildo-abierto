import type {ReactNode} from 'react';
import type {TopicBlock} from '@cabildo-abierto/api';
import {parseImageBlock} from '@cabildo-abierto/utils';
import {cn} from '@/lib/utils';
import {ImageBlockFrame} from './image-block-frame';
export function TopicBlockFrame({block,children}: {block:TopicBlock;children:ReactNode}) {
    const value=block.typeId==='imagen'?parseImageBlock(block.content):null;
    return value?<ImageBlockFrame value={value}>{children}</ImageBlockFrame>:<div className={cn(block.typeId!=='parrafo'&&'clear-both')}>{children}</div>;
}
