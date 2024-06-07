import React from "react"
import {getPostsAndDiscussions} from "@/actions/get-comment";
import DiscussionComponent from "@/components/discussion";
import PostComponent from "@/components/post";
import Feed from "@/components/feed";


const FeedPage: React.FC = async () => {
    const feed = await getPostsAndDiscussions()

    return <Feed contents={feed}/>
}

export default FeedPage