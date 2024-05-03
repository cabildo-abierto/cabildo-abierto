"use client"

import AutoExpandingTextarea from "@/components/autoexpanding_textarea"
import {db} from "@/db"
import Discussion from "@/components/discussion";
import React, {useState} from "react";
import {useRouter} from "next/navigation";
import {createDiscussion} from "@/actions/create-discussion";
import {useSession} from "next-auth/react";
import discussion from "@/components/discussion";

interface NewCommentProps {
    handleAddComment: (comment: any, email: any) => Promise<void>
}

const NewComment: React.FC<NewCommentProps> = ({handleAddComment: handleAddComment}) => {
    const [comment, setComment] = useState('');
    const {data: session, status} = useSession()
    const router = useRouter();

    return (
        <>
            <AutoExpandingTextarea placeholder={"Agregá un comentario..."} onChange={(value) => {
                setComment(value)
            }} minHeight="80px"/>

            <div className="flex justify-between mt-3">
                <button onClick={() => router.back()}
                        className="bg-gray-200 hover:bg-gray-300 transition duration-200 font-bold py-2 px-4 rounded">
                    Volver
                </button>
                <button onClick={() => {
                    handleAddComment(comment, session?.user?.email)
                }}
                        className="bg-gray-200 hover:bg-gray-300 transition duration-200 font-bold py-2 px-4 rounded">
                    Enviar
                </button>
            </div>
        </>
    )
}

export default NewComment
