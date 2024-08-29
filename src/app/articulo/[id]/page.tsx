"use client"

import { ArticlePage } from "src/components/article-page"



const Page: React.FC<{
    params: {id: string}
}> = ({params}) => {

    return <ArticlePage entityId={params.id}/>

}

export default Page