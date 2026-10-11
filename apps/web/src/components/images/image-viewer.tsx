import {Dialog} from '@base-ui/react/dialog';
import type {ImageContent} from '@cabildo-abierto/api';
import {ExpandedWindow} from '@/components/expanded-window';
import {TextWithLinks} from '@/components/ui/text-with-links';
import {cn} from '@/lib/utils';
export function ImageViewer({value,url,open,onClose}: {value:ImageContent;url:string;open:boolean;onClose:()=>void}) {
    return <Dialog.Root open={open} onOpenChange={open=>{if(!open)onClose();}}><Dialog.Portal>
        <ExpandedWindow kind="image">
            <figure className={cn('m-0 flex h-full min-h-0 flex-col gap-3')}>
                <img src={url} alt={value.alt} className={cn('min-h-0 w-full flex-1 object-contain')} draggable={false}/>
                {value.caption && <figcaption className={cn('max-h-[30%] shrink-0 overflow-auto whitespace-pre-wrap text-sm text-muted-foreground wrap-anywhere')}><TextWithLinks text={value.caption}/></figcaption>}
            </figure>
        </ExpandedWindow>
    </Dialog.Portal></Dialog.Root>;
}
