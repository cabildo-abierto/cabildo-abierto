"use client"
import React from "react";
import { ThreeColumnsLayout } from "@/components/main-layout";
import { ContentWithComments } from "@/components/content-with-comments";
import { ErrorPage } from "@/components/error-page";
import { useContents } from "@/components/use-contents";
import LoadingPage from "@/components/loading-page";


const ContentPage: React.FC<{params: any}> = ({params}) => {
    const {contents, setContents} = useContents()

    if(!contents){
        return <LoadingPage/>
    }

    const parentContent = contents[params?.id]

    if(!parentContent){
        return <ErrorPage>No se encontró el contenido</ErrorPage>
    }

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

    return <ThreeColumnsLayout center={center}/>
}

export default ContentPage
