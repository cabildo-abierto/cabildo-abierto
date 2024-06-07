import React from "react";
import {ContentProps, ContentText, AddCommentButton, ContentTopRow, CommentCount} from "@/components/comment"

const OpinionComponent: React.FC<{content: ContentProps}> = async ({content}) => {
    return <div className="bg-white border-b border-t">
        <ContentTopRow type={"👥"} content={content}/>
        <ContentText content={content}/>

        <div className="flex justify-between px-1">
            <div>
                <AddCommentButton text="Agregar comentario" onClick={() => {}}/>
            </div>
            <CommentCount content={content}/>
        </div>
    </div>
};

export default OpinionComponent;