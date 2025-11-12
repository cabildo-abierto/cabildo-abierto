import { useRef, useEffect } from 'react';

export const DescriptionInput = ({
                                     onChange,
                                     description
}: {
    description: string
    onChange: (t: string) => void
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const maxLength = 100;

    const handleChange = (e: any) => {
        const value = e.target.value;
        const truncatedValue = value.substring(0, maxLength);
        onChange(truncatedValue);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, []);

    return (
        <textarea
            ref={textareaRef}
            onChange={handleChange}
            placeholder="Bajada"
            className="w-full text-[18px] outline-none bg-[var(--background)] font-light resize-none whitespace-pre-wrap"
            value={description}
            onInput={() => {
                if (textareaRef.current) {
                    const value = textareaRef.current.value.replace(/\n/g, '');
                    textareaRef.current.value = value.substring(0, maxLength);
                    textareaRef.current.style.height = 'auto';
                    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
                }
            }}
            rows={1}
            maxLength={maxLength}
        />
    );
};
