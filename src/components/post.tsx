import React, { useState } from "react";
import {ContentProps, ContentText, AddCommentButton, ContentTopRow, CommentCount} from "@/components/comment"

const PostComponent: React.FC<{content: ContentProps}> = async ({content}) => {
    const [writingComment, setWritingComment] = useState(false);
    
    return <div className="bg-white border-b border-t">
        <ContentTopRow type={"💬"} content={content}/>
        <ContentText content={content}/>

        <div className="flex justify-between px-1">
            <div>
                <AddCommentButton text="Agregar comentario" onClick={() => {setWritingComment(true)}}/>
            </div>
            <CommentCount content={content}/>
        </div>
    </div>
};

export default PostComponent;