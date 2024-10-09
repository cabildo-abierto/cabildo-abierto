
export const IntegerInputPlusMinus = ({value, onChange}: {value: number, onChange: (v: number) => void}) => {

    const handleIncrement = () => {
        onChange(value + 1);
    };

    const handleDecrement = () => {
        onChange(Math.max(value - 1, 0)); // Prevents going below 0
    };

    const handleChange = (e) => {
        const value = e.target.value;
        // Only allow integers
        if (/^\d*$/.test(value)) {
            onChange(Number(value));
        }
    };

    const btnClassname = "bg-[var(--primary)] hover:bg-[var(--primary-dark)] w-7 h-7 text-white rounded disabled:bg-gray-500"

    return (
        <div className="flex items-center space-x-2">
            <button
                onClick={handleDecrement}
                className={btnClassname}
                disabled={value <= 1}
            >
                -
            </button>
            <input
                id="integer-input"
                type="text"
                value={value}
                autoFocus={true}
                onChange={handleChange}
                className="px-4 py-1 border rounded-md focus:outline-none w-24 text-center text-gray-900"
            />
            <button
                onClick={handleIncrement}
                className={btnClassname}
            >
                +
            </button>
        </div>
    );
};