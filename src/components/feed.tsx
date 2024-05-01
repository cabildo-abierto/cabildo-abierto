import React from "react";
import Post from "./post"


const Feed: React.FC<{ feed }> = ({ feed }) => {
    return <> {feed.map((post) => (
            <div key={post.id} className="post">
                <Post post={post}/>
            </div>
        ))}
    </>
};

export default Feed