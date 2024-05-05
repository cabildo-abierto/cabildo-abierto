import React from "react"
import {getAllDiscussions} from "@/actions/get-comment";
import Comment from "@/components/comment";


const Home: React.FC = async () => {
    const feed = await getAllDiscussions()

    return <div className="border-r border-l h-screen w-full">
        <div className="py-8">
        {feed.map((discussion) => (
            <Comment comment={discussion}/>
        ))}
        </div>
    </div>
}

export default Home