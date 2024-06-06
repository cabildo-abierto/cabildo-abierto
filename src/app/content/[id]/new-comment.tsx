"use client"

import TextareaAutosize from 'react-textarea-autosize';
import { useRouter } from "next/navigation";
import React, {useEffect, useState} from "react";

interface NewCommentProps {
    handleAddComment: (comment: any) => Promise<void>
}

const NewComment: React.FC<NewCommentProps> = ({handleAddComment: handleAddComment}) => {
    const [comment, setComment] = useState('')
    const [textAreaOnFocus, setTextAreaOnFocus] = useState(false)
    const [buttonVisible, setButtonVisible] = useState(false)
    const router = useRouter()

    const handleTextAreaOnFocus = () => {
        setTextAreaOnFocus(true)
    }
    const handleTextAreaOnBlur = () => {
        setTextAreaOnFocus(false)
    }

    // Hack para que el boton no desaparezca antes de que se llame a onClick
    // Seguramente haya una mejor forma de hacer esto
    useEffect(() => {
        let timeoutId: NodeJS.Timeout
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
            <TextareaAutosize className="w-full bg-white border rounded-lg p-2 resize-none focus:border-gray-500 transition duration-200"
                placeholder={"Agregá un comentario..."}
                minRows={2}
                onChange={(event) => {setComment(event.target.value)}}
                onFocus={handleTextAreaOnFocus}
                onBlur={handleTextAreaOnBlur}
                value={comment}
            />

            {buttonVisible && <div className="flex justify-end mt-2">
                <button onClick={async () => {
                    let sentComment: string = comment
                    setComment('')
                    await handleAddComment(sentComment)
                    router.refresh()
                }}
                        className="bg-gray-200 hover:bg-gray-300 transition duration-200 font-semibold py-2 px-4 rounded">
                    Enviar
                </button>
            </div>}
            </div>
        </>
    )
}

export default NewComment
