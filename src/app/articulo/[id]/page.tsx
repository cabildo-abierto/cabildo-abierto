"use client"

import { ArticlePage } from "@/components/article-page"



const Page: React.FC<{
    params: {id: string}
}> = ({params}) => {

    return <ArticlePage entityId={params.id}/>

}

export default Page