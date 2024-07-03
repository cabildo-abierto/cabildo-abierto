import React from "react"
import {getPostsAndDiscussions} from "@/actions/get-comment";
import Feed from "@/components/feed";


const FeedPage: React.FC = async () => {
    const feed = await getPostsAndDiscussions()

    return <div className="mx-auto max-w-4xl bg-white h-full">
        <h1 className="text-2xl ml-2 py-8 font-semibold mb-8">
            General
        </h1>
        <Feed contents={feed}/>
    </div>
}

export default FeedPage