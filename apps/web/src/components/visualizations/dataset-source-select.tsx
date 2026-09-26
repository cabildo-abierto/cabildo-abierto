"use client";
import {useState} from 'react';
import {Combobox} from '@base-ui/react/combobox';
import {useQuery} from '@tanstack/react-query';
import {CaretDownIcon, CheckIcon} from '@phosphor-icons/react';
import type {DatasetSource} from '@cabildo-abierto/api';
import {dataViewRequest} from '@/utils/react/data-view-request';
import {useDebouncedValue} from '@/hooks/use-debounced-value';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Spinner} from '@/components/ui/spinner';
import {cn} from '@/lib/utils';

const label = (source: DatasetSource) => `${source.title} · ${source.topic.title} · ${source.blockNumber}`;
export function DatasetSourceSelect({topicId, value, onChange, label: fieldLabel = 'Conjunto de datos', placeholder = 'Elegir…'}: {topicId: string; value: DatasetSource | null; onChange: (source: DatasetSource) => void; label?: string; placeholder?: string}) {
    const [search,setSearch] = useState('');
    const debounced = useDebouncedValue(search,300);
    const catalog = useQuery({queryKey: ['dataset-catalog', topicId, debounced], queryFn: async () => {
        const output = await dataViewRequest<{sources: DatasetSource[]}>(`/datasets?topicId=${encodeURIComponent(topicId)}&search=${encodeURIComponent(debounced)}`);
        return output.sources;
    }, retry: false});
    const loading = catalog.isFetching || search !== debounced;
    return <div className={cn('grid gap-1 text-xs text-muted-foreground')}>
        <Combobox.Root items={catalog.data ?? []} value={value} filter={null} inputValue={search} onInputValueChange={setSearch}
            itemToStringLabel={label} isItemEqualToValue={(a,b) => a.topicId === b.topicId && a.blockNumber === b.blockNumber}
            onValueChange={source => { if (source) onChange(source); }} onOpenChange={open => { if (open) setSearch(''); }}>
            <Combobox.Label>{fieldLabel}</Combobox.Label>
            <Combobox.Trigger render={<Button type="button" variant="outline" className={cn('w-full min-w-0 justify-between font-normal')}/>}>
                <span className={cn('min-w-0 truncate')} title={value ? label(value) : undefined}>{value ? label(value) : placeholder}</span><CaretDownIcon/>
            </Combobox.Trigger>
            <Combobox.Portal><Combobox.Positioner sideOffset={4} className={cn('z-50')}>
                <Combobox.Popup data-attachment-editor-popup className={cn('w-(--anchor-width) max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10')}>
                    <div className={cn('border-b p-2')}><Combobox.Input render={<Input/>} aria-label="Buscar conjunto de datos por tema o título" placeholder="Buscar por tema o título…"/></div>
                    {loading && <div className={cn('flex justify-center p-2')}><Spinner/></div>}
                    {catalog.error && <p role="alert" className={cn('p-3 text-xs text-destructive')}>{catalog.error.message}</p>}
                    <Combobox.Empty>{!loading && !catalog.error && <p className={cn('p-3 text-xs text-muted-foreground')}>No encontramos conjuntos de datos publicados.</p>}</Combobox.Empty>
                    <Combobox.List className={cn('max-h-60 overflow-y-auto p-1')}>
                        {(source: DatasetSource) => <Combobox.Item key={JSON.stringify([source.topicId,source.blockNumber])} value={source} className={cn('flex cursor-default items-center gap-2 rounded-md px-2 py-2 text-xs outline-none data-highlighted:bg-accent data-highlighted:text-accent-foreground')}>
                            <span className={cn('min-w-0 flex-1')}><span className={cn('block truncate font-medium')}>{source.title}</span><span className={cn('block truncate text-muted-foreground')}>{source.topic.title} · {source.blockNumber}</span></span>
                            <Combobox.ItemIndicator><CheckIcon/></Combobox.ItemIndicator>
                        </Combobox.Item>}
                    </Combobox.List>
                </Combobox.Popup>
            </Combobox.Positioner></Combobox.Portal>
        </Combobox.Root>
    </div>;
}
