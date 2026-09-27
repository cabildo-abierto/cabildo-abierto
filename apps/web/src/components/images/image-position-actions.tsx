import {AlignLeftIcon, AlignCenterHorizontalIcon, AlignRightIcon, ParagraphIcon, RowsIcon} from "@phosphor-icons/react";
import type {ImageContent} from "@cabildo-abierto/api";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";

export function ImagePositionActions({value, onChange, disabled}: {
    value: ImageContent;
    onChange: (value: ImageContent) => void;
    disabled?: boolean;
}) {
    const alignments = [
        {alignment: "left", label: "Alinear a la izquierda", Icon: AlignLeftIcon},
        {alignment: "center", label: "Centrar imagen", Icon: AlignCenterHorizontalIcon},
        {alignment: "right", label: "Alinear a la derecha", Icon: AlignRightIcon},
    ] as const;
    return <>
        {alignments.map(({alignment, label, Icon}) => <Button key={alignment} type="button" variant="ghost" size="sm"
            title={label} aria-label={label} aria-pressed={value.alignment === alignment}
            disabled={disabled || (alignment === "center" && value.flow === "wrap")}
            className={cn("text-muted-foreground", value.alignment === alignment && "bg-muted text-foreground")}
            onClick={() => onChange({...value, alignment})}><Icon/></Button>)}
        <Button type="button" variant="ghost" size="sm" title="Fila propia" aria-label="Mostrar imagen en una fila propia"
            aria-pressed={value.flow === "separate"} disabled={disabled}
            className={cn("text-muted-foreground", value.flow === "separate" && "bg-muted text-foreground")}
            onClick={() => onChange({...value, flow: "separate"})}><RowsIcon/></Button>
        <Button type="button" variant="ghost" size="sm" title="Texto alrededor" aria-label="Mostrar texto alrededor de la imagen"
            aria-pressed={value.flow === "wrap"} disabled={disabled}
            className={cn("text-muted-foreground", value.flow === "wrap" && "bg-muted text-foreground")}
            onClick={() => onChange({...value, flow: "wrap", alignment: value.alignment === "center" ? "left" : value.alignment})}><ParagraphIcon/></Button>
    </>;
}
