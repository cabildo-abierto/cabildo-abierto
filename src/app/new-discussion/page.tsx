"use client"

import React, {useState} from "react";
import AutoExpandingTextarea from "./autoexpanding_textarea"
import { createDiscussion } from '@/actions/createDiscussion'
import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation";

const NewDiscussion: React.FC = () => {
    const [title, setTitle] = useState('');
    const { data: session, status } = useSession()
    const router = useRouter();

    const handleContentChange = (value: string) => {
        setTitle(value);
    };

    const email = session?.user?.email

    const handleCreateDiscussion = () => {
        createDiscussion({title, email: email})
        router.push("/")
    }

    return (
        <div className="flex justify-center mt-8">
            <div className="flex flex-col w-1/3">
                <h3 className="text-lg mb-2 font-bold">Empezá una discusión</h3>

                <AutoExpandingTextarea
                    placeholder="Podés arrancar con una pregunta..."
                    onChange={handleContentChange}
                    minHeight="80px"
                />
                <div className="flex justify-between mt-3">
                    <button onClick={() => router.push("/feed")}
                            className="bg-gray-200 hover:bg-gray-300 transition duration-200 font-bold py-2 px-4 rounded">
                        Volver
                    </button>
                    <button onClick={handleCreateDiscussion}
                            className="bg-gray-200 hover:bg-gray-300 transition duration-200 font-bold py-2 px-4 rounded">
                        Enviar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewDiscussion;

