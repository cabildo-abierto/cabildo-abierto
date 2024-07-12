import React from "react"
import ContentComponent from "@/components/content";

const Feed: React.FC<{contents: any[]}> = ({contents}) => {
    return <div className="h-full w-full">
        <div className="">
            {contents.map((content, index) => {
                return <div key={index} className="py-1">
                    <ContentComponent content={content} isMainContent={false}/>
                </div>
            })}
        </div>
    </div>
}

export default Feed