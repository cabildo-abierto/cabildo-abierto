import React from "react";
import Link from "next/link";

export type DiscussionProps = {
    id: string;
    title: string;
    author: {
        name: string;
        email: string;
    } | null;
    content: string;
    _count: {
        comments: number
    }
};

const Discussion: React.FC<{ discussion: DiscussionProps }> = ({ discussion }) => {
    const authorName = discussion.author ? discussion.author.name : "Unknown author";

    return (
        <Link href={`/discussion/${discussion.id}`}>
            <div className="bg-white shadow-md rounded-lg p-4 mb-4 cursor-pointer relative">
                <h2 className="text-xl font-bold mb-1">{discussion.title}</h2>
                <p className="text-gray-600 text-sm">{authorName}</p>
                <div className="absolute bottom-0 right-0 mr-1">
                    <p className="text-gray-600 text-sm">{discussion._count.comments} comentarios</p>
                </div>
            </div>
        </Link>
    );
};

export default Discussion;