import {BlockEditActions} from '@/components/block-edit-actions';
export function ImageEditActions(props: {onEdit:()=>void;onRemove:()=>void;disabled:boolean}) {
    return <BlockEditActions label="imagen" {...props}/>;
}
