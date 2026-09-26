import {useState} from 'react';
import {Input} from '@/components/ui/input';

export function VisualizationBinBoundaries({boundaries, onChange}: {boundaries: number[]; onChange: (boundaries: number[]) => void}) {
    const [text, setText] = useState(() => boundaries.join('; '));
    return <Input
        aria-label="Límites de intervalos separados por punto y coma"
        placeholder="0; 10; 20"
        value={text}
        onChange={event => {
            const value = event.target.value;
            setText(value);
            onChange(value.split(';').map(part => part.trim() ? Number(part.trim()) : NaN));
        }}
    />;
}
