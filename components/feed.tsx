import React from "react";
import Post, {PostProps} from "./post"


const Feed: React.FC<{ feed: PostProps[] }> = ({ feed }) => {
    return <> {feed.map((post) => (
            <div key={post.id} className="post">
                <Post post={post}/>
            </div>
        ))}
    </>
};

export default Feed