import React from "react"
import {getPostsAndDiscussions} from "@/actions/get-comment";
import DiscussionComponent from "@/components/discussion";
import PostComponent from "@/components/post";


const getFeedElementComponent = (content: any) => {
    var component: React.JSX.Element
    if(content.type == "Discussion"){
        component = <DiscussionComponent content={content}/>
    } else if(content.type == "Post"){
        component = <PostComponent content={content}/>
    } else {
        component = <>Ocurrió un error cargando el contenido</>
    }
    return <div key={content.id}>
        {component}
    </div>
}


const Feed: React.FC<{contents: any[]}> = async ({contents}) => {
    return <div className="border-r border-l h-screen w-full">
        <div className="py-8">
            {contents.map(getFeedElementComponent)}
        </div>
    </div>
}

export default Feed