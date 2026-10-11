"use client";
import {useState} from 'react';
import {CaretDownIcon, CaretUpIcon} from '@phosphor-icons/react';
import {Input} from './input';
import {Button} from './button';
import {cn} from '@/lib/utils';

type NumberInputProps = Omit<React.ComponentProps<typeof Input>, 'value' | 'onChange' | 'type' | 'min' | 'max' | 'step'> & {
    value: number | null; onValueChange: (value: number | null) => void; min?: number; max?: number; step?: number;
};

export function NumberInput({value, onValueChange, min, max, step = 1, className, disabled, ...props}: NumberInputProps) {
    const [draft, setDraft] = useState({value, text: value === null ? '' : String(value)});
    if (draft.value !== value) setDraft({value, text: value === null ? '' : String(value)});
    const change = (text: string) => {
        const number = text === '' ? null : Number(text);
        if (number !== null && !Number.isFinite(number)) return;
        setDraft({value: number ?? value, text});
        onValueChange(number);
    };
    const adjust = (direction: number) => {
        const current = draft.text === '' ? (min ?? 0) : Number(draft.text);
        const next = draft.text === '' ? current : current + direction * step;
        change(String(Number(Math.max(min ?? -Infinity, Math.min(max ?? Infinity, next)).toFixed(10))));
    };
    return <div className={cn('relative w-28 max-w-full', className)}>
        <Input {...props} type="number" value={draft.text} min={min} max={max} step={step} disabled={disabled}
            className={cn('pr-8 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none')}
            onChange={event => change(event.target.value)}/>
        <div className={cn('absolute inset-y-px right-px flex w-6 flex-col border-l')}>
            <Button type="button" variant="ghost" disabled={disabled || draft.text !== '' && max !== undefined && Number(draft.text) >= max} aria-label="Aumentar" className={cn('h-1/2 w-full rounded-none p-0 [&_svg]:size-3')} onClick={() => adjust(1)}><CaretUpIcon/></Button>
            <Button type="button" variant="ghost" disabled={disabled || draft.text !== '' && min !== undefined && Number(draft.text) <= min} aria-label="Disminuir" className={cn('h-1/2 w-full rounded-none p-0 [&_svg]:size-3')} onClick={() => adjust(-1)}><CaretDownIcon/></Button>
        </div>
    </div>;
}
