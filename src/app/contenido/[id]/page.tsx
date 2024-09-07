import React from "react";
import { ThreeColumnsLayout } from "src/components/three-columns";
import { ContentWithCommentsFromId } from "src/components/content-with-comments";


const ContentPage: React.FC<{params: any}> = ({params}) => {
    const center = <div className="">
        <div className="flex flex-col h-full">
            <div className="mt-8">
                <ContentWithCommentsFromId
                    contentId={params.id}
                    isMainPage={true}
                    inCommentSection={false}
                />
            </div>
        </div>
    </div>

    return <ThreeColumnsLayout center={center}/>
}

export default ContentPage
