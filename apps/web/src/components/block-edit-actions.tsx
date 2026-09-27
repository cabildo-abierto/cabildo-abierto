import {PencilSimpleIcon,TrashIcon} from '@phosphor-icons/react';
import {Button} from '@/components/ui/button';
export function BlockEditActions({label,onEdit,onRemove,disabled}: {label:string;onEdit:()=>void;onRemove:()=>void;disabled:boolean}) {
    return <><Button type="button" variant="ghost" size="sm" aria-label={'Editar '+label} disabled={disabled} onClick={onEdit}><PencilSimpleIcon/></Button><Button type="button" variant="ghost" size="sm" aria-label={'Quitar '+label} disabled={disabled} onClick={onRemove}><TrashIcon/></Button></>;
}
