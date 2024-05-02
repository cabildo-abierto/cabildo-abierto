"use client"

import React, {useState} from "react";
import AutoExpandingTextarea from "@/components/autoexpanding_textarea"
import { createDiscussion } from '@/actions/createDiscussion'
import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation";

const NewDiscussion: React.FC = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const { data: session, status } = useSession()
    const router = useRouter();

    const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(event.target.value); // Update title state
    };

    const handleContentChange = (value: string) => {
        setContent(value); // Update content state
    };

    const email = session?.user?.email

    const handleCreateDiscussion = () => {
        createDiscussion({title, content, email: email})
        router.push("/")
    }

    return (
        <div className="flex justify-center mt-8">
            <div className="flex flex-col w-1/3">
                <h3 className="text-lg mb-2">Nueva discusión</h3>
                <p className="text-sm text-gray-700">Título</p>
                <input
                    type="text"
                    placeholder=""
                    value={title}
                    onChange={handleTitleChange}
                    className="flex w-full justify-center bg-white border border-gray-300 rounded mb-4 pl-4 pr-4"
                />

                <p className="text-sm text-gray-700">Contenido</p>
                <AutoExpandingTextarea
                    placeholder=""
                    onChange={handleContentChange}
                />
                <div className="flex justify-end mt-3">
                    <button onClick={handleCreateDiscussion}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Start
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewDiscussion;

