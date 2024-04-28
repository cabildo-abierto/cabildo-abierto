import React, {useState} from "react";
import AutoExpandingTextarea from "./autoexpanding_textarea"

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
        <div className="border rounded">
            <div className="ml-3 mr-3 mt-2 mb-2">
            <h3 className="text-lg mb-2">Nueva discusión</h3>
            <p className="text-sm text-gray-400">Título</p>
            <input
                type="text"
                placeholder=""
                value={title} // Bind value to title state
                onChange={handleTitleChange} // Handle title change
                className="flex w-full justify-center bg-white border border-gray-300 rounded mb-4 pl-4 pr-4"
            />

            <p className="text-sm text-gray-400">Contenido</p>
            <AutoExpandingTextarea
                placeholder=""
                onChange={handleContentChange} // Handle content change
            />
            <div className="flex justify-end">
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

