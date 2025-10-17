import {Input, Slider} from "@mui/material";


export const SliderWithInput = ({value, onChange, label, max, min=0, step=1}: {
    value: number, onChange: (v: number) => void, label: string, max: number, min?: number, step?: number}) => {
    return <div>
        <div className={"text-xs text-[var(--text-light)]"}>
            {label}
        </div>
        <div className={"flex space-x-4 pl-3"}>
        <Slider
            value={typeof value === 'number' ? value : 0}
            onChange={(e, v) => {onChange(v)}}
            aria-labelledby='input-slider'
            size={"small"}
            max={max}
            min={min}
            step={step}
        />
        <Input
            value={typeof value === 'number' ? value : 0}
            size="small"
            onChange={e => {onChange(e.target.value === '' ? 0 : Number(e.target.value))}}
            inputProps={{
                step: step,
                min: min,
                max: max,
                type: 'number',
                'aria-labelledby': 'input-slider'
            }}
        />
        </div>
    </div>
}