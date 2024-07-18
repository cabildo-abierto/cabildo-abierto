import React from "react";
import {getContentById} from "@/actions/get-content";
import { ThreeColumnsLayout } from "@/components/main-layout";
import { ContentWithComments } from "@/components/content-with-comments";
import { getUserId } from "@/actions/get-user";


const ContentPage: React.FC<{params: any}> = async ({params}) => {
    const parentContent = await getContentById(params?.id, await getUserId())
    if(!parentContent){
        return false
    }

    // TO DO: Allow post comments
    const center = <div className="">
        <div className="flex flex-col h-full">
            <div className="mt-8">
                <ContentWithComments
                    content={parentContent.content}
                    comments={parentContent.children}
                    isPostPage={true}
                />
            </div>
        </div>
    </div>


    return <ThreeColumnsLayout center={center}/>
}

export default ContentPage
