import {useState} from 'react';
import {Input} from '@/components/ui/input';

export function VisualizationAngleInput({value, label, onChange}: {value: number; label: string; onChange: (value: number) => void}) {
    const [draft, setDraft] = useState({value, text: String(value)});
    if (draft.value !== value) setDraft({value, text: String(value)});
    return <Input type="number" min={-90} max={90} aria-label={`Rotación de ${label}`} value={draft.text}
        onChange={event => {
            const text = event.target.value;
            const number = event.target.valueAsNumber;
            const valid = text !== '' && Number.isFinite(number) && number >= -90 && number <= 90;
            setDraft({value: valid ? number : value, text});
            if (valid) onChange(number);
        }}
        onBlur={() => {
            const number = Number(draft.text);
            const next = draft.text !== '' && Number.isFinite(number) ? Math.max(-90, Math.min(90, number)) : value;
            setDraft({value: next, text: String(next)});
            if (next !== value) onChange(next);
        }}/>
}
