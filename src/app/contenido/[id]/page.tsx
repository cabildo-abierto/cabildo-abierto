import React from "react";
import {getContentById} from "@/actions/get-content";
import { ThreeColumnsLayout } from "@/components/main-layout";
import { ContentWithComments } from "@/components/content-with-comments";
import { requireSubscription } from "@/components/utils";
import { ErrorPage } from "@/components/error-page";


const ContentPage: React.FC<{params: any}> = async ({params}) => {
    const parentContent = await getContentById(params?.id)
    if(!parentContent){
        return <ErrorPage>No se encontró el contenido</ErrorPage>
    }

    // TO DO: Allow post comments
    const center = <div className="">
        <div className="flex flex-col h-full">
            <div className="mt-8">
                <ContentWithComments
                    content={parentContent}
                    isPostPage={true}
                />
            </div>
        </div>
    </div>


    return requireSubscription(<ThreeColumnsLayout center={center}/>, true)
}

export default ContentPage
