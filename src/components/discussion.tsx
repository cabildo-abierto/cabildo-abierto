import React from "react";
import Link from "next/link";

export type DiscussionProps = {
    id: string;
    title: string;
    author: {
        id: string;
        name: string;
        email: string;
    } | null;
    content: string;
    _count: {
        comments: number
    }
    createdAt: Date
};

const Discussion: React.FC<{ discussion: DiscussionProps }> = ({ discussion }) => {
    const options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    };

    const optionsTime = {
        hour12: false,
        seconds: false,
    };

    const date = discussion.createdAt.toLocaleTimeString('es-AR', optionsTime) + " " + discussion.createdAt.toLocaleDateString('es-AR', options)

    return (
        <div className="bg-white border-t border-b mb-2 relative">
            <div className="flex mb-4 ml-2">
                <a className="text-xl font-bold" href={`/discussion/${discussion.id}`}>{discussion.title}</a>
            </div>

            <div className="bottom-0 left-0 flex justify-between">
                <p className="text-gray-600 text-sm ml-2">
                    Por <a href={"/profile/" + discussion.author?.id}>{discussion.author?.name}</a>, {discussion._count.comments} comentarios
                </p>

                <p className="text-gray-600 text-xs mr-1">{date}</p>
            </div>

        </div>
    );
};

export default Discussion;