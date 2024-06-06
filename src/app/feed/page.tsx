import React from "react"
import {getPostsAndDiscussions} from "@/actions/get-comment";
import CommentComponent from "@/components/comment";


const Feed: React.FC = async () => {
    const feed = await getPostsAndDiscussions()

    return <div className="border-r border-l h-screen w-full">
        <div className="py-8">
        {feed.map((content) => (
            <div key={content.id}>
                <CommentComponent comment={content}/>
            </div>
        ))}
        </div>
    </div>
}

export default Feed