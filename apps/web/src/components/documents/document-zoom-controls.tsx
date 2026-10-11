import {MinusIcon, PlusIcon} from '@phosphor-icons/react';
import {Button} from '@/components/ui/button';
import {cn} from '@/lib/utils';

export function DocumentZoomControls({zoom, onChange}: {zoom: number; onChange: (zoom: number) => void}) {
    return <div role="group" aria-label="Zoom del documento" className={cn('absolute right-8 bottom-3 z-10 flex items-center gap-0.5 rounded-md border bg-background/95 p-1 text-foreground shadow-md')}>
        <Button type="button" variant="ghost" size="icon-xs" disabled={zoom <= 50} aria-label="Alejar" title="Alejar" onClick={() => onChange(zoom - 25)}><MinusIcon/></Button>
        <Button type="button" variant="ghost" size="xs" className={cn('min-w-12 tabular-nums')} aria-label={`Zoom ${zoom}%. Restablecer al 100%`} title="Restablecer al 100%" onClick={() => onChange(100)}>{zoom}%</Button>
        <Button type="button" variant="ghost" size="icon-xs" disabled={zoom >= 200} aria-label="Acercar" title="Acercar" onClick={() => onChange(zoom + 25)}><PlusIcon/></Button>
    </div>;
}
