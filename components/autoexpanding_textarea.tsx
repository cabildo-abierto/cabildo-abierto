import React, {useState} from "react";

interface AutoExpandingTextareaProps {
    placeholder: string;
    onChange: (value: string) => void; // Add onChange prop
}

const AutoExpandingTextarea: React.FC<AutoExpandingTextareaProps> = ({ placeholder, onChange }) => {
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
            className="w-full bg-white border border-gray-300 rounded p-4 resize-none"
            style={{ minHeight: '80px', overflowY: 'hidden' }}
        />
    );
};

export default AutoExpandingTextarea