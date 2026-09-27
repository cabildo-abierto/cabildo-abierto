import {BlockEditActions} from '@/components/block-edit-actions';
export function VisualizationEditActions(props: {onEdit:()=>void;onRemove:()=>void;disabled:boolean}) {
    return <BlockEditActions label="visualización" {...props}/>;
}
