import { getUserActivityById, getUserById, getUserIdByUsername } from "@/actions/get-user";
import React from "react";
import Feed from "@/components/feed";


const UserProfile: React.FC<{ params: { id: string } }> = async ({ params }) => {
    let user = await getUserById(params?.id)
    if (!user) {
        const id = await getUserIdByUsername(params?.id)
        if(!id) {
            return <>El usuario no existe</>
        }
        user = await getUserById(id.id)
        if(!user) {
            return <>El usuario no existe</>
        }
    }

    const activity = await getUserActivityById(user.id);
    return <div className="bg-white">
        <div className="mx-auto max-w-4xl bg-white border-l border-r h-full">
            <h1 className="text-2xl ml-2 py-8 font-semibold mb-8">
                {user.name ? user.name : '@' + user.username}
            </h1>
            <Feed contents={activity}/>
        </div>
    </div>
}

export default UserProfile