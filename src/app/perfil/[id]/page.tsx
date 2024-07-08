import { getUserActivityById, getUserById, getUserIdByUsername } from "@/actions/get-user";
import React from "react";
import Feed from "@/components/feed";
import { ThreeColumnsLayout } from "@/components/main-layout";


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

    const center = <div className="bg-white">
        <div className="bg-white h-full">
            <h3 className="ml-2 py-8">
                {user.name ? user.name : '@' + user.username}
            </h3>
            <Feed contents={activity}/>
        </div>
    </div>

    return <ThreeColumnsLayout center={center}/>
}

export default UserProfile