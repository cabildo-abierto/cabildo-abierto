import React from "react";
import { getContentById } from "../../../actions/contents";
import { ContentWithComments } from "../../../components/content-with-comments";
import { ThreeColumnsLayout } from "../../../components/three-columns";
import { headers } from 'next/headers'


const ContentPage: React.FC<{params: any}> = async ({params}) => {
    const content = await getContentById(params.id)
    const header = headers()
    const ip = (header.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0]
    console.log("IP", ip, "read content", params.id)

    const center = <div className="">
        <div className="flex flex-col h-full">
            <div className="mt-8">
                <ContentWithComments
                    content={content}
                    isMainPage={true}
                    inCommentSection={false}
                />
            </div>
        </div>
    </div>

    return <ThreeColumnsLayout center={center}/>
}

export default ContentPage
