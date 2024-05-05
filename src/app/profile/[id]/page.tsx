import {getUserActivityById} from "@/actions/get-user";
import React from "react";
import Comment from "@/components/comment";


export default async function UserProfile({params}) {
    const user = await getUserActivityById(params?.id);

    return <div className="bg-white">
        <div className="mx-auto max-w-4xl bg-white border-l border-r h-screen">
            <h1 className="text-2xl ml-2 py-4 font-semibold mb-8">
                {user.name}
            </h1>
            <div>
                <div> {user.comments.map((discussion) => (
                    <div key={discussion.id}>
                    <Comment comment={discussion}/>
                    </div>
                ))}
                </div>
            </div>
        </div>
    </div>

}