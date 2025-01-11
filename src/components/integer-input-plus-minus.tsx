import { IconButton } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

export const IntegerInputPlusMinus = ({value, onChange}: {value: number, onChange: (v: number) => void}) => {

    const handleIncrement = () => {
        onChange(value + 500);
    };

    const handleDecrement = () => {
        onChange(Math.max(value - 500, 0));
    };

    const handleChange = (e) => {
        const value = e.target.value.slice(1);
        // Only allow integers
        if (/^\d*$/.test(value)) {
            onChange(Number(value));
        }
    };

    const btnClassname = "bg-[var(--primary)] hover:bg-[var(--primary-dark)] w-7 h-7 text-white rounded disabled:bg-gray-500"

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
                value={"$"+value}
                autoFocus={true}
                onChange={handleChange}
                className="px-4 py-1 border rounded-md focus:outline-none w-32 text-center "
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