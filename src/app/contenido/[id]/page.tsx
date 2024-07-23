import React from "react";
import {getContentById} from "@/actions/get-content";
import { ThreeColumnsLayout } from "@/components/main-layout";
import { ContentWithComments } from "@/components/content-with-comments";
import { getUserId } from "@/actions/get-user";
import { requireSubscription } from "@/components/utils";
import { ErrorPage } from "@/components/error-page";


const ContentPage: React.FC<{params: any}> = async ({params}) => {
    const userId = await getUserId()
    if(!userId) return <ErrorPage>Error al cargar el contenido: Necesitás una cuenta</ErrorPage>
    const parentContent = await getContentById(params?.id, userId)
    if(!parentContent){
        return <ErrorPage>Error al cargar el contenido: No se encontró el contenido</ErrorPage>
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


    return requireSubscription(<ThreeColumnsLayout center={center}/>, true)
}

export default ContentPage
