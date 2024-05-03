import React from "react";
import Discussion from "@/components/discussion"


const Feed: React.FC<{ feed }> = ({ feed }) => {
    return <div> {feed.map((discussion) => (
            <div key={discussion.id} className="post">
                <Discussion discussion={discussion}/>
            </div>
        ))}
    </div>
};

export default Feed