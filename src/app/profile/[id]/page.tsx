import {getUserActivityById} from "@/actions/get-user";
import React from "react";
import Comment from "@/components/comment";


export default async function UserProfile({params}) {
    const user = await getUserActivityById(params?.id);

    return <div className="bg-white">
        <div className="mx-auto max-w-4xl bg-white border-l border-r h-screen">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 py-2 px-2 border-b">{user.name}</h1>
        <div>
            <div> {user.comments.map((discussion) => (
                <div key={discussion.id} className="post">
                    <Comment comment={discussion}/>
                </div>
            ))}
            </div>
        </div>
        </div>
    </div>

}