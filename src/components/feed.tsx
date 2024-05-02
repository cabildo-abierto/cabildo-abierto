import React from "react";
import Post from "./post"


const Feed: React.FC<{ feed }> = ({ feed }) => {
    return <div> {feed.map((post) => (
            <div key={post.id} className="post">
                <Post post={post}/>
            </div>
        ))}
    </div>
};

export default Feed