import React from "react"
import ContentComponent from "@/components/content";


const Feed: React.FC<{contents: any[]}> = async ({contents}) => {
    return <div className="h-full w-full">
        <div className="">
            {contents.map((content) => {return <ContentComponent content={content} isMainContent={false}/>})}
        </div>
    </div>
}

export default Feed