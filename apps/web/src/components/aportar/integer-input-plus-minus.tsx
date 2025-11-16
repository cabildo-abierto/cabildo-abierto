import {MinusIcon, PlusIcon } from "@phosphor-icons/react";
import {BaseIconButton} from "@/components/utils/base/base-icon-button";


export const IntegerInputPlusMinus = ({value, onChange, delta}: {value: number, delta: number, onChange: (v: number) => void}) => {

    const handleIncrement = () => {
        onChange(value + delta);
    };

    const handleDecrement = () => {
        onChange(Math.max(value - delta, 0));
    };

    const handleChange = (e) => {
        const value = e.target.value.replace("$", "")
        if (/^\d*$/.test(value)) {
            onChange(Number(value));
        }
    };

    return (
        <div className="flex items-center space-x-2">
            <BaseIconButton
                onClick={handleDecrement}
                size="small"
                disabled={value <= 1}
            >
                <MinusIcon/>
            </BaseIconButton>

            <input
                id="integer-input"
                type="text"
                value={"$"+value}
                autoFocus={true}
                onChange={handleChange}
                className="px-4 py-2 text-lg bg-[var(--background-dark3)] rounded-md focus:outline-none w-32 text-center "
            />

            <BaseIconButton
                onClick={handleIncrement}
                size="small"
            >
                <PlusIcon/>
            </BaseIconButton>
        </div>
    );
};