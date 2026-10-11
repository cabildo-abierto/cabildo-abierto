import {NumberInput} from '@/components/ui/number-input';

export function VisualizationAngleInput({value, label, onChange}: {value: number; label: string; onChange: (value: number) => void}) {
    return <NumberInput min={-90} max={90} aria-label={`Rotación de ${label}`} value={value}
        onValueChange={angle => {if (angle !== null && angle >= -90 && angle <= 90) onChange(angle);}}/>;
}
