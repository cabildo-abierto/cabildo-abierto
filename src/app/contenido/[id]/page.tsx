import React from "react";
import { getContentById } from "../../../actions/contents";
import { ContentWithComments } from "../../../components/content-with-comments";
import { ThreeColumnsLayout } from "../../../components/three-columns";
import { headers } from 'next/headers'
import { getUserId, logVisit } from "../../../actions/users";
import { userAgent } from "next/server";
import { NoVisitsAvailablePopup } from "../../../components/no-visits-popup";
import { monthly_visits_limit, visitsThisMonth } from "../../../components/utils";


const ContentPage: React.FC<{params: any}> = async ({params}) => {
    const content = await getContentById(params.id)
    const header = headers()
    const user = userAgent({headers: header})

    const userId = await getUserId()

    let visitOK = true
    if(!userId && content.type == "Post"){
        const noAccountUser = await logVisit(header, user, content.id)
        const visits = visitsThisMonth(noAccountUser.visits)

        if(visits >= monthly_visits_limit){
            visitOK = false
        }
    }

    const center = <div className="flex flex-col h-full">
        {content.type == "Post" && !visitOK && <NoVisitsAvailablePopup/>}
        <div className="mt-8">
            <ContentWithComments
                content={content}
                isMainPage={true}
                inCommentSection={false}
            />
        </div>
    </div>

    return <ThreeColumnsLayout center={center}/>
}

export default ContentPage
