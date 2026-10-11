"use client";
import {useState} from 'react';
import {Popover} from '@base-ui/react/popover';
import {RichTextEditor} from '@/components/rich-text/rich-text-editor';
import {cn} from '@/lib/utils';

export function TableCellEditor({topicId, content, footnoteNumbers, onChange}: {
    topicId: string; content: string; footnoteNumbers: ReadonlyMap<string, number>; onChange: (content: string) => void;
}) {
    const [anchor, setAnchor] = useState<HTMLDivElement | null>(null);
    const [toolbar, setToolbar] = useState<HTMLDivElement | null>(null);
    return <div ref={setAnchor} className={cn('rich-text-content min-h-10')}>
        <RichTextEditor topicId={topicId} content={content} footnoteNumbers={footnoteNumbers} toolbarContainer={toolbar} onChange={onChange} onDeleteEmpty={() => {}}/>
        <Popover.Root open={!!anchor} modal={false}>
            <Popover.Portal>
                <Popover.Positioner anchor={anchor?.closest<HTMLTableCellElement>('td, th') ?? anchor} side="bottom" align="start" sideOffset={12} collisionPadding={12} className={cn('z-[60] max-w-[calc(100vw-1.5rem)]')}>
                    <Popover.Popup initialFocus={false} finalFocus={false} role="toolbar" aria-label="Editar celda" data-attachment-editor-popup className={cn('outline-none')}>
                        <div ref={setToolbar}/>
                    </Popover.Popup>
                </Popover.Positioner>
            </Popover.Portal>
        </Popover.Root>
    </div>;
}
