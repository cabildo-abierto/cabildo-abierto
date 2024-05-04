"use client"

import AutoExpandingTextarea from "@/components/autoexpanding_textarea"
import React, {useEffect, useState} from "react";

interface NewCommentProps {
    handleAddComment: (comment: any) => Promise<void>
}

const NewComment: React.FC<NewCommentProps> = ({handleAddComment: handleAddComment}) => {
    const [comment, setComment] = useState('');
    const [textAreaOnFocus, setTextAreaOnFocus] = useState(false);
    const [buttonVisible, setButtonVisible] = useState(false);

    const handleContentChange = (value: string) => {
        setComment(value);
    };

    const handleTextAreaOnFocus = () => {
        setTextAreaOnFocus(true)
    }
    const handleTextAreaOnBlur = () => {
        setTextAreaOnFocus(false)
    }

    // Hack para que el boton no desaparezca antes de que se llame a onClick
    useEffect(() => {
        let timeoutId;
        if (textAreaOnFocus) {
            setButtonVisible(true);
        } else {
            timeoutId = setTimeout(() => {
                setButtonVisible(false);
            }, 100);
        }
        return () => {
            clearTimeout(timeoutId);
        };
    }, [textAreaOnFocus]);


    return (
        <>
            <div>
            <AutoExpandingTextarea placeholder={"Agregá un comentario..."}
                                   minHeight="80px"
                                   onChange={handleContentChange}
                                   onFocus={handleTextAreaOnFocus}
                                   onBlur={handleTextAreaOnBlur}
            />

            {buttonVisible && <div className="flex justify-end mt-2">
                <button onClick={() => {
                    handleAddComment(comment)
                }}
                        className="bg-gray-200 hover:bg-gray-300 transition duration-200 font-bold py-2 px-4 rounded">
                    Enviar
                </button>
            </div>}
            </div>
        </>
    )
}

export default NewComment
