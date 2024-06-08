import React from "react"
import {getPostsAndDiscussions} from "@/actions/get-comment";
import Feed from "@/components/feed";


const FeedPage: React.FC = async () => {
    const feed = await getPostsAndDiscussions()

    return <div className="mt-8">
        <Feed contents={feed}/>
    </div>
}

export default FeedPage