import { IconButton } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import {useMonthlyValue} from "@/queries/api";

export const IntegerInputPlusMinus = ({value, onChange, delta}: {value: number, delta: number, onChange: (v: number) => void}) => {

    const handleIncrement = () => {
        onChange(value + delta);
    };

    const handleDecrement = () => {
        onChange(Math.max(value - delta, 0));
    };

    const handleChange = (e) => {
        const value = e.target.value
        // Only allow integers
        if (/^\d*$/.test(value)) {
            onChange(Number(value));
        }
    };

    return (
        <div className="flex items-center space-x-2">
            <IconButton
                onClick={handleDecrement}
                color="primary"
                
                size="small"
                disabled={value <= 1}
            >
                <RemoveIcon/>
            </IconButton>

            <input
                id="integer-input"
                type="text"
                value={value}
                autoFocus={true}
                onChange={handleChange}
                className="px-4 py-2 text-lg bg-[var(--background-dark2)] rounded-md focus:outline-none w-32 text-center "
            />

            <IconButton
                onClick={handleIncrement}
                color="primary"
                size="small"
            >
                <AddIcon/>
            </IconButton>
        </div>
    );
};