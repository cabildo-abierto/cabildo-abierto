import React from "react"
import { ContentWithComments } from "./content-with-comments";

const Feed: React.FC<{contents: any[]}> = ({contents}) => {
    return <div className="h-full w-full">
        <div className="">
            {contents.map((content, index) => {
                return <div key={index} className="py-1">
                    <ContentWithComments content={content.content} comments={content.children}/>
                </div>
            })}
        </div>
    </div>
}

export default Feed