import React, {useState} from "react";

interface AutoExpandingTextareaProps {
    placeholder: string;
    onChange: (value: string) => void;
    minHeight: string;
}

const AutoExpandingTextarea: React.FC<AutoExpandingTextareaProps> = ({ placeholder, onChange, minHeight }) => {
    const [value, setValue] = useState('');

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setValue(event.target.value);
        event.target.style.height = 'auto'; // Reset height
        event.target.style.height = `${event.target.scrollHeight}px`; // Set new height
        onChange(event.target.value); // Call onChange prop
    };

    return (
        <textarea
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            className="w-full bg-white border rounded p-2 resize-none focus:border-gray-500 transition duration-200"
            style={{
                minHeight: minHeight,
                overflowY: 'hidden',
                outline: 'none'
            }}
        />
    );
};



export default AutoExpandingTextarea