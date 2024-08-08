import React from "react";
import { ThreeColumnsLayout } from "@/components/main-layout";
import { ContentWithComments } from "@/components/content-with-comments";
import { ErrorPage } from "@/components/error-page";
import { getContentById } from "@/actions/get-content";
import { getContentsMap } from "@/components/update-context";
import { getUser } from "@/actions/get-user";


const ContentPage: React.FC<{params: any}> = async ({params}) => {
    const parentContent = await getContentById(params.id)
    const contents = await getContentsMap()
    const user = await getUser()

    if(!parentContent || parentContent.isDraft){
        return <ErrorPage>No se encontró el contenido</ErrorPage>
    }

    const center = <div className="">
        <div className="flex flex-col h-full">
            <div className="mt-8">
                <ContentWithComments
                    user={user}
                    content={parentContent}
                    contents={contents}
                    isPostPage={true}
                />
            </div>
        </div>
    </div>

    return <ThreeColumnsLayout center={center}/>
}

export default ContentPage
