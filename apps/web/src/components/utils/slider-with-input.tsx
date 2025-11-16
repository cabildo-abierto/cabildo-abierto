import {Slider} from "@/components/utils/ui/slider";
import {BaseTextField} from "@/components/utils/base/base-text-field";


export const SliderWithInput = ({value, onChange, label, max, min=0, step=1}: {
    value: number, onChange: (v: number) => void, label: string, max: number, min?: number, step?: number}) => {
    return <div>
        <div className={"text-xs text-[var(--text-light)]"}>
            {label}
        </div>
        <div className={"flex space-x-4 pl-3"}>
        <Slider
            value={typeof value === 'number' ? [value] : [0]}
            onValueChange={(v) => {onChange(v[0])}}
            aria-labelledby='input-slider'
            max={max}
            min={min}
            step={step}
        />
        <BaseTextField
            className={"w-20 "}
            inputGroupClassName={""}
            value={value}
            type="number"
            onChange={e => {
                onChange(e.target.value === '' ? 0 : Number(e.target.value))
            }}
            min={min}
            max={max}
            step={step}
            aria-labelledby='input-slider'
        />
        </div>
    </div>
}