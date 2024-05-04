import React from "react";
import Discussion from "@/components/discussion"


const Feed: React.FC<{ feed }> = ({ feed }) => {
    return <div className="border-l border-r h-screen w-1/3"> {feed.map((discussion) => (
            <div key={discussion.id} className="post">
                <Discussion discussion={discussion}/>
            </div>
        ))}
    </div>
};

export default Feed