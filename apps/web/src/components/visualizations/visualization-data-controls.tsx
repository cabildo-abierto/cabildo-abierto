import type {BasicDataView, DatasetSource} from '@cabildo-abierto/api';
import {DotsThreeIcon} from '@phosphor-icons/react';
import {Button} from '@/components/ui/button';
import {DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem} from '@/components/ui/dropdown-menu';
import {Spinner} from '@/components/ui/spinner';
import {cn} from '@/lib/utils';
import {DataViewForm} from './data-view-form';
import {LccaQueryEditor} from './lcca-query-editor';

type Props = {
    topicId: string; advanced: boolean; automatic: boolean; query: string;
    view: BasicDataView | null; busy: boolean; error: string | null;
    onAdvanced: () => void; onAutomatic: () => void;
    onQuery: (query: string) => void; onView: (view: BasicDataView) => void; onSource: (source: DatasetSource) => void;
};
export function VisualizationDataControls(props: Props) {
    return <section className={cn('space-y-3')}>
        <div className={cn('flex items-center justify-between gap-2')}>
            <h3 className={cn('text-sm font-medium')}>{props.advanced ? 'Consulta avanzada' : 'Datos'}</h3>
            {props.busy && <Spinner/>}
            {!props.advanced && <DropdownMenu>
                <DropdownMenuTrigger render={<Button type="button" variant="ghost" size="icon-sm" aria-label="Opciones de datos"/>}><DotsThreeIcon/></DropdownMenuTrigger>
                <DropdownMenuContent align="end"><DropdownMenuItem onClick={props.onAdvanced}>Editar LCCA</DropdownMenuItem></DropdownMenuContent>
            </DropdownMenu>}
        </div>
        {props.error && <p role="alert" className={cn('text-xs text-destructive')}>{props.error}</p>}
        {props.advanced ? <>
            <p className={cn('text-xs text-muted-foreground')}>Escribí una consulta LCCA.</p>
            {props.automatic && !props.view && props.error && <Button type="button" size="xs" variant="outline" onClick={() => props.onQuery(props.query)}>Conservar como consulta personalizada</Button>}
            <LccaQueryEditor topicId={props.topicId} query={props.query} onChange={props.onQuery}/>
            <Button type="button" size="xs" variant="outline" disabled={props.busy} onClick={props.onAutomatic}>Volver al formulario</Button>
        </> : <DataViewForm topicId={props.topicId} view={props.view} onChange={props.onView} onSource={props.onSource}/>}
    </section>;
}
