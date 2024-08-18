import React from "react";
import { ThreeColumnsLayout } from "@/components/main-layout";
import { ContentWithComments } from "@/components/content-with-comments";


const ContentPage: React.FC<{params: any}> = ({params}) => {
    const center = <div className="">
        <div className="flex flex-col h-full">
            <div className="mt-8">
                <ContentWithComments
                    contentId={params.id}
                    isPostPage={true}
                />
            </div>
        </div>
    </div>

    return <ThreeColumnsLayout center={center}/>
}

export default ContentPage
