import type {ReactNode,CSSProperties} from 'react';
import type {ImageContent} from '@cabildo-abierto/api';
import {cn} from '@/lib/utils';
export function ImageBlockFrame({value,children}: {value:ImageContent;children:ReactNode}) {
    const wrap=value.flow==='wrap';
    const panelLeft=value.alignment==='right'?'100%':value.alignment==='center'?'calc((var(--topic-flow-width) + 100%) / 2)':'var(--topic-flow-width)';
    return <div data-image-frame style={{'--image-width':value.widthPercent+'%','--topic-panel-left':panelLeft} as CSSProperties}
        className={cn('relative clear-both w-full min-w-0 md:w-(--image-width)',
            wrap&&'md:z-20 md:max-w-[calc(100%_-_1rem)]',
            wrap&&value.alignment==='left'&&'md:float-left md:mr-4 md:mb-2',
            wrap&&value.alignment==='right'&&'md:float-right md:ml-4 md:mb-2',
            !wrap&&value.alignment==='center'&&'md:mx-auto',
            !wrap&&value.alignment==='right'&&'md:ml-auto')}>{children}</div>;
}
