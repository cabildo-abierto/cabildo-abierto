import React from "react"
import ContentComponent from "@/components/content";


const Feed: React.FC<{contents: any[]}> = async ({contents}) => {
    return <div className="border-r border-l h-screen w-full">
        <div className="py-8">
            {contents.map((content) => {return <ContentComponent content={content}/>})}
        </div>
    </div>
}

export default Feed