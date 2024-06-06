import React, {useState} from "react";

interface AutoExpandingTextareaProps {
    placeholder: string;
    onChange: (value: string) => void;
    minHeight: string;
    onFocus: () => void;
}

const AutoExpandingTextarea = ({ placeholder, onChange, minHeight, onFocus = () => {}, onBlur = () => {}}) => {
    const [value, setValue] = useState('');

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setValue(event.target.value);
        event.target.style.height = 'auto';
        event.target.style.height = `${event.target.scrollHeight}px`;
        onChange(event.target.value);
    };

    return (
        <textarea
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            className="w-full bg-white border rounded-lg p-2 resize-none focus:border-gray-500 transition duration-200"
            style={{
                minHeight: minHeight,
                overflowY: 'hidden',
                outline: 'none'
            }}
            onFocus={onFocus}
            onBlur={onBlur}
        />
    );
};



export default AutoExpandingTextarea