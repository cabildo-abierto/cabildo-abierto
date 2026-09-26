import {PencilSimpleIcon, TrashIcon} from '@phosphor-icons/react';
import {Button} from '@/components/ui/button';
export function VisualizationEditActions({onEdit, onRemove, disabled}: {onEdit: () => void; onRemove: () => void; disabled: boolean}) {
    return <><Button type="button" size="sm" variant="ghost" aria-label="Editar visualización" disabled={disabled} onClick={onEdit}><PencilSimpleIcon/></Button><Button type="button" size="sm" variant="ghost" aria-label="Quitar visualización" disabled={disabled} onClick={onRemove}><TrashIcon/></Button></>;
}
