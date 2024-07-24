import React from "react"
import { ContentWithComments } from "./content-with-comments";
import { ContentAndChildrenProps } from "@/actions/get-content";

const Feed: React.FC<any> = ({feed}) => {
    if(!feed){
        return <div className="h-full w-full flex items-center justify-center">
            Cargando...
        </div>
    }
    
    return <div className="h-full w-full">
        {feed.map((content: ContentAndChildrenProps, index: number) => {
            return <div key={index} className="py-1">
                <ContentWithComments
                    content={content.content}
                    comments={content.children}
                />
            </div>
        })}
    </div>
}

export default Feed