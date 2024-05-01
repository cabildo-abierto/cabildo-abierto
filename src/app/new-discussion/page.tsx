"use client"

import React, {useState} from "react";
import AutoExpandingTextarea from "@/components/autoexpanding_textarea"

const addDiscussion = async (discussionData) => {
    try {
        const response = await fetch('/api/addDiscussion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(discussionData),
        });
        const result = await response.json();
        console.log('Discussion added:', result);
    } catch (error) {
        console.error('Error adding discussion in request:', error);
    }
};

interface NewDiscussionProps {
    createDiscussion: (title: string, content: string) => void
}

const NewDiscussion: React.FC<NewDiscussionProps> = ({ createDiscussion }) => {
    const [title, setTitle] = useState(''); // State for title
    const [content, setContent] = useState(''); // State for content

    const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(event.target.value); // Update title state
    };

    const handleContentChange = (value: string) => {
        setContent(value); // Update content state
    };

    const handleCreateDiscussion = () => {
        createDiscussion(title, content); // Call createDiscussion with title and content
    };
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