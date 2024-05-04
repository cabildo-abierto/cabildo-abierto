import {getUserActivityById} from "@/actions/get-user";
import React from "react";
import Discussion from "@/components/discussion";


export default async function UserProfile({params}) {
    const user = await getUserActivityById(params?.id);

    return <div className="bg-gray-600">
        <div className="mx-auto max-w-4xl bg-white h-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 py-2 px-2">{user.name}</h1>
        <div>
            <div> {user.discussions.map((discussion) => (
                <div key={discussion.id} className="post">
                    <Discussion discussion={discussion}/>
                </div>
            ))}
            </div>
        </div>
        </div>
    </div>

}