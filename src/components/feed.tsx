import React from "react"
import ContentComponent from "@/components/content";


const Feed: React.FC<{contents: any[]}> = async ({contents}) => {
    return <div className="h-full w-full">
        <div className="py-8">
            {contents.map((content) => {return <ContentComponent content={content}/>})}
        </div>
    </div>
}

export default Feed