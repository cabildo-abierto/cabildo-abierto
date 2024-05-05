"use client"

import React, {useState} from "react";
import AutoExpandingTextarea from "@/components/autoexpanding_textarea"
import { createComment } from '@/actions/create-comment'
import {useRouter} from "next/navigation";

const NewDiscussion: React.FC = () => {
    const [content, setContent] = useState('');
    const router = useRouter();

    const handleContentChange = (value: string) => {
        setContent(value);
    };

    const handleCreateDiscussion = async () => {
        const success = await createComment(content, undefined)
        if(success) {
            router.push("/")
        }
    }

    return (
        <div className="flex justify-center mt-8">
            <div className="flex flex-col w-3/4">
                <h3 className="text-lg mb-2 font-bold">Nueva discusión</h3>

                <AutoExpandingTextarea
                    placeholder="..."
                    onChange={handleContentChange}
                    minHeight="80px"
                />
                <div className="flex justify-between mt-3">
                    <button onClick={() => router.push("/feed")}
                            className="bg-gray-200 hover:bg-gray-300 transition duration-200 font-bold py-2 px-4 rounded">
                        Volver
                    </button>
                    <button
                        onClick={handleCreateDiscussion}
                        disabled={content.length === 0}
                        className={`py-2 px-4 rounded font-bold transition duration-200 ${
                            content.length === 0 ? "bg-gray-200 text-gray-500" : "bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
                        }`}
                    >
                        Enviar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewDiscussion;

