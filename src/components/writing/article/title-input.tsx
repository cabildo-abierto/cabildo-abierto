import { useRef, useEffect } from 'react';

export const TitleInput = ({ onChange, title }: {title: string, onChange: (t: string) => void}) => {
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
            placeholder="Título"
            className=""
            value={title}
            onInput={() => {
                if (textareaRef.current) {
                    const value = textareaRef.current.value.replace(/\n/g, '');
                    textareaRef.current.value = value.substring(0, maxLength);
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
