"use client";
import {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {Dialog} from '@base-ui/react/dialog';
import {TableIcon, XIcon} from '@phosphor-icons/react';
import type {TableContent, DatasetSource, StaticTableContent} from '@cabildo-abierto/api';
import {parseTableBlock, staticTableCells, isRichTextEmpty} from '@cabildo-abierto/utils';
import {dataViewRequest} from '@/utils/react/data-view-request';
import {Button} from '@/components/ui/button';
import {ScrollArea} from '@/components/ui/scroll-area';
import {DatasetSourceSelect} from '@/components/visualizations/dataset-source-select';
import {StaticTableEditor} from './static-table-editor';
import {DatasetTableOptions} from './dataset-table-options';
import {DatasetTable} from './dataset-table';
import {TableChangeConfirmation} from './table-change-confirmation';
import {cn} from '@/lib/utils';

const emptyTable = (): StaticTableContent => ({version: 1, mode: 'static', showHeaders: true, headers: ['', '', ''], rows: Array.from({length: 3}, () => ['', '', ''])});
export function TableEditorPopup({topicId, initialContent, onConfirm, onClose}: {topicId: string; initialContent?: string; onConfirm: (content: string) => void; onClose: () => void}) {
    const [value, setValue] = useState<TableContent>(() => parseTableBlock(initialContent ?? '') ?? emptyTable());
    const [mode, setMode] = useState(value.mode);
    const [pending, setPending] = useState<'static' | 'dataset' | null>(null);
    const reference = value.mode === 'dataset' ? value.source : null;
    const source = useQuery({queryKey: ['dataset-source', reference?.topicId, reference?.blockNumber], enabled: mode === 'dataset' && !!reference,
        queryFn: ({signal}) => dataViewRequest<DatasetSource>(`/datasets/${encodeURIComponent(reference!.topicId)}/${encodeURIComponent(reference!.blockNumber)}`, {signal}), retry: false});
    const changeMode = (mode: 'static' | 'dataset') => {setMode(mode); setValue(emptyTable());};
    const chooseMode = (next: 'static' | 'dataset') => {
        if (next === mode) return;
        if (value.mode === 'dataset' || staticTableCells(value).some(cell => !isRichTextEmpty(cell))) setPending(next);
        else changeMode(next);
    };
    const selectSource = (source: DatasetSource) => {
        setValue({version: 1, mode: 'dataset', source: {topicId: source.topicId, blockNumber: source.blockNumber},
            columns: source.columns.slice(0, 200).map(column => ({field: column.name})), pageSize: 10, order: null});
    };
    const valid = !!parseTableBlock(JSON.stringify(value)) && value.mode === mode && (mode === 'static' || !!source.data && value.mode === 'dataset' && value.columns.every(column => source.data!.columns.some(item => item.name === column.field)));
    return <Dialog.Root open disablePointerDismissal onOpenChange={open => {if (!open) onClose();}}><Dialog.Portal>
        <Dialog.Backdrop data-attachment-editor-popup className={cn('fixed inset-0 z-50 bg-black/40')}/>
        <Dialog.Popup data-attachment-editor-popup className={cn('fixed top-1/2 left-1/2 z-50 flex h-[90dvh] w-[calc(100vw-2rem)] max-w-5xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border bg-popover shadow-xl outline-none')}>
            <header className={cn('flex shrink-0 items-center gap-2 border-b px-4 py-3')}><TableIcon/><Dialog.Title className={cn('flex-1 text-sm font-medium')}>{initialContent ? 'Editar' : 'Insertar'} tabla</Dialog.Title><Dialog.Close render={<Button type="button" variant="ghost" size="icon-sm"/>} aria-label="Cerrar"><XIcon/></Dialog.Close></header>
            <Dialog.Description className={cn('sr-only')}>Editá una tabla estática o elegí un conjunto de datos.</Dialog.Description>
            <ScrollArea className={cn('min-h-0 flex-1')} viewportClassName={cn('h-full')}><div className={cn('space-y-4 p-4')}>
                <div className={cn('flex gap-2')}><Button type="button" size="sm" variant={mode === 'static' ? 'secondary' : 'outline'} highlightPressed aria-pressed={mode === 'static'} onClick={() => chooseMode('static')}>Tabla estática</Button><Button type="button" size="sm" variant={mode === 'dataset' ? 'secondary' : 'outline'} highlightPressed aria-pressed={mode === 'dataset'} onClick={() => chooseMode('dataset')}>Conjunto de datos</Button></div>
                {mode === 'static' && value.mode === 'static' && <StaticTableEditor topicId={topicId} value={value} onChange={setValue}/>}
                {mode === 'dataset' && <>
                    <div className={cn('w-full max-w-md')}><DatasetSourceSelect topicId={topicId} value={source.data ?? null} onChange={selectSource}/></div>
                    {source.error && <p role="alert" className={cn('text-xs text-destructive')}>{source.error.message}</p>}
                    {value.mode === 'dataset' && source.data && <DatasetTableOptions value={value} columns={source.data.columns} onChange={setValue}/>}
                    {valid && value.mode === 'dataset' && <DatasetTable key={JSON.stringify([value.source, value.columns.map(column => column.field), value.pageSize, value.order])} value={value}/>}
                </>}
                {!valid && value.mode === mode && mode === 'static' && <p role="alert" className={cn('text-xs text-destructive')}>La tabla supera el tamaño permitido. Reducí el contenido para guardarla.</p>}
            </div></ScrollArea>
            <footer className={cn('flex shrink-0 justify-end gap-2 border-t px-4 py-3')}><Button type="button" size="sm" variant="outline" onClick={onClose}>Cancelar</Button><Button type="button" size="sm" disabled={!valid} onClick={() => onConfirm(JSON.stringify(value))}>{initialContent ? 'Confirmar cambios' : 'Agregar tabla'}</Button></footer>
            <TableChangeConfirmation open={!!pending} onCancel={() => setPending(null)} onConfirm={() => {if (pending) changeMode(pending); setPending(null);}}/>
        </Dialog.Popup>
    </Dialog.Portal></Dialog.Root>;
}
