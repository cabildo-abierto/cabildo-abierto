import { useRef, useEffect } from 'react';

export const TitleInput = ({ onChange, title }: any) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const maxLength = 100;

    const handleChange = (e: any) => {
        const value = e.target.value;
        // Truncate value if it exceeds the maximum length
        const truncatedValue = value.substring(0, maxLength);
        onChange(truncatedValue);
        if (textareaRef.current) {
            // Reset height to auto to shrink if needed
            textareaRef.current.style.height = 'auto';
            // Set the height to scrollHeight to adjust for new content
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };

    useEffect(() => {
        if (textareaRef.current) {
            // Adjust the height on initial render
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, []);

    return (
        <textarea
            ref={textareaRef}
            onChange={handleChange}
            placeholder="Título"
            className=""
            value={title}
            onInput={() => {
                if (textareaRef.current) {
                    // Remove new lines and truncate to maximum length
                    const value = textareaRef.current.value.replace(/\n/g, '');
                    textareaRef.current.value = value.substring(0, maxLength);
                    // Adjust height again after modifying the value
                    textareaRef.current.style.height = 'auto';
                    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
                }
            }}
            style={{
                width: '100%',
                fontSize: '32px',
                borderRadius: '5px',
                outline: 'none',
                fontWeight: 'bold',
                resize: 'none',
                overflow: 'hidden',
                whiteSpace: 'pre-wrap',
                backgroundColor: 'var(--background)'
            }}
            rows={1}
            maxLength={maxLength}
        />
    );
};
